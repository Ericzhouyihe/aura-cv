import { createFileRoute } from "@tanstack/react-router";
import { AIModelType, AI_MODEL_CONFIGS } from "@/config/ai";
import { formatGeminiErrorMessage, getGeminiModelInstance } from "@/lib/server/gemini";

const parseUpstreamError = (raw: string, fallback: string) => {
  if (!raw) return { message: fallback };
  try {
    const data = JSON.parse(raw) as {
      error?: { message?: string; code?: string };
      message?: string;
    };
    return {
      message: data.error?.message || data.message || fallback,
      code: data.error?.code
    };
  } catch {
    return { message: raw };
  }
};

export const Route = createFileRoute("/api/polish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, content, modelType, apiEndpoint, customInstructions } = body as {
            apiKey: string;
            model: string;
            content: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            customInstructions?: string;
          };

          const modelConfig = AI_MODEL_CONFIGS[modelType as AIModelType];
          if (!modelConfig) {
            throw new Error("Invalid model type");
          }

          let systemPrompt = `你是一名资深的简历内容优化专家，擅长把平庸的简历描述改写成专业、有力、具体的表达。

用户会提供一段简历片段（Markdown 纯文本，列表项以"- "开头）。请逐条优化。

优化要求：
1. 用专业、具体的动词开头（如"主导""设计""落地""推动""搭建"），删除"负责""参与"等弱表达。
2. 优先保留并强化量化成果（百分比、规模、时长、排名）；原文没有的数据不得编造。
3. 不改变事实与原意：不虚构经历、技能、职位或数据。
4. 删除空话套话，每条保持"一个职责/一个成果"的信息密度。
5. 严格保持条目数量与顺序，与原文逐条对应，不合并、不拆分。

输出格式（必须严格遵守）：
1. 只输出优化后的正文，逐条以"- "开头的纯文本列表，与原文条目一一对应。
2. 禁止使用任何 Markdown 修饰语法：不得出现 **加粗**、*斜体*、# 标题、\`代码\`、~~删除线~~，正文一律纯文本。
3. 禁止用代码块（\`\`\`）包裹输出。
4. 禁止输出任何前言、解释、总结、建议或引导语（如"以下是…""根据您提供…"）。
5. 语言与输入一致：中文输入输出中文，英文输入输出英文。
6. 用户额外要求（如有）优先级最高，但同样不得违反上述格式约束。`;

          if (customInstructions?.trim()) {
            systemPrompt += `\n\n用户额外要求：\n${customInstructions.trim()}`;
          }

          if (modelType === "gemini") {
            const geminiModel = model || "gemini-flash-latest";
            const modelInstance = getGeminiModelInstance({
              apiKey,
              model: geminiModel,
              systemInstruction: systemPrompt,
              generationConfig: {
                temperature: 0.4,
              },
            });

            const encoder = new TextEncoder();

            const stream = new ReadableStream({
              async start(controller) {
                try {
                  const result = await modelInstance.generateContentStream(content);
                  for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                      controller.enqueue(encoder.encode(chunkText));
                    }
                  }
                } catch (error) {
                  controller.error(error);
                  return;
                }
                controller.close();
              },
            });

            return new Response(stream, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
              }
            });
          }

          const response = await fetch(modelConfig.url(apiEndpoint), {
            method: "POST",
            headers: modelConfig.headers(apiKey),
            body: JSON.stringify({
              model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content
                }
              ],
              stream: true
            })
          });

          if (!response.ok) {
            const fallbackMessage = `Upstream API error: ${response.status} ${response.statusText}`;
            const rawError = await response.text();
            const parsedError = parseUpstreamError(rawError, fallbackMessage);
            return Response.json(
              { error: parsedError },
              { status: response.status }
            );
          }

          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              if (!response.body) {
                controller.close();
                return;
              }

              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let pending = "";

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    break;
                  }

                  pending += decoder.decode(value, { stream: true });
                  const lines = pending.split(/\r?\n/);
                  pending = lines.pop() ?? "";

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;

                    try {
                      const payload = trimmed.slice(5).trim();
                      if (!payload || payload === "[DONE]") continue;

                      const data = JSON.parse(payload) as {
                        error?: { message?: string };
                        choices?: Array<{ delta?: { content?: string } }>;
                      };
                      if (data.error?.message) {
                        controller.error(new Error(data.error.message));
                        return;
                      }

                      const deltaContent = data.choices?.[0]?.delta?.content;
                      if (deltaContent) {
                        controller.enqueue(encoder.encode(deltaContent));
                      }
                    } catch (e) {
                      console.error("Error parsing JSON:", e);
                    }
                  }
                }

                const tail = (pending + decoder.decode()).trim();
                if (tail.startsWith("data:")) {
                  const payload = tail.slice(5).trim();
                  if (payload && payload !== "[DONE]") {
                    const data = JSON.parse(payload) as {
                      choices?: Array<{ delta?: { content?: string } }>;
                    };
                    const deltaContent = data.choices?.[0]?.delta?.content;
                    if (deltaContent) {
                      controller.enqueue(encoder.encode(deltaContent));
                    }
                  }
                }

                controller.close();
              } catch (error) {
                console.error("Stream reading error:", error);
                controller.error(error);
              }
            }
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive"
            }
          });
        } catch (error) {
          console.error("Polish error:", error);
          return Response.json(
            { error: formatGeminiErrorMessage(error) },
            { status: 500 }
          );
        }
      }
    }
  }
});
