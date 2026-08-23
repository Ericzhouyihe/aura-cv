import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { formatDateString } from "@/lib/utils";
import {
  BasicInfo,
  getBorderRadiusValue,
  GlobalSettings,
} from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import SectionWrapper from "../../shared/SectionWrapper";
import { useLocale } from "@/i18n/compat/client";
import GithubContribution from "@/components/shared/GithubContribution";
import {
  getCustomFieldDisplayText,
  getCustomFieldHref,
} from "@/lib/customField";

interface BaseInfoProps {
  basic: BasicInfo | undefined;
  globalSettings: GlobalSettings | undefined;
  template?: ResumeTemplate;
}

const BaseInfo = ({
  basic = {} as BasicInfo,
  globalSettings,
  template,
}: BaseInfoProps) => {
  const locale = useLocale();
  const themeColor =
    globalSettings?.themeColor || template?.colorScheme.primary || "#397da7";

  const getIcon = (iconName: string | undefined) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ElementType;
    return IconComponent ? (
      <IconComponent className="h-[14px] w-[14px] shrink-0" />
    ) : null;
  };

  const orderedFields = React.useMemo(() => {
    if (!basic.fieldOrder) {
      return [
        {
          key: "email",
          value: basic.email,
          icon: basic.icons?.email || "Mail",
          custom: false,
        },
      ].filter((item) => Boolean(item.value));
    }

    return basic.fieldOrder
      .filter(
        (field) =>
          field.visible !== false && field.key !== "name" && field.key !== "title"
      )
      .map((field) => ({
        key: field.key,
        value:
          field.key === "birthDate" && basic[field.key]
            ? formatDateString(basic[field.key] as string, locale)
            : (basic[field.key] as string),
        icon: basic.icons?.[field.key] || "User",
        custom: false,
      }))
      .filter((item) => Boolean(item.value));
  }, [basic, locale]);

  const allFields = [
    ...orderedFields,
    ...(basic.customFields
      ?.filter(
        (field) =>
          field.visible !== false && Boolean(getCustomFieldDisplayText(field))
      )
      .map((field) => ({
        key: field.id,
        value: getCustomFieldDisplayText(field),
        icon: field.icon || "CircleUserRound",
        custom: true,
        href: getCustomFieldHref(field),
      })) || []),
  ];

  const nameField = basic.fieldOrder?.find((field) => field.key === "name") || {
    key: "name" as const,
    visible: true,
  };
  const titleField = basic.fieldOrder?.find((field) => field.key === "title") || {
    key: "title" as const,
    visible: true,
  };

  return (
    <SectionWrapper sectionId="basic" className="rounded-none">
      <div className="flex flex-col">
        {basic.photo && basic.photoConfig?.visible && (
          <motion.div layout="position" className="mb-20 flex justify-center">
            <div
              className="overflow-hidden border-4 border-white shadow-[0_3px_10px_rgba(15,23,42,0.12)]"
              style={{
                width: `${basic.photoConfig?.width || 108}px`,
                height: `${basic.photoConfig?.height || 132}px`,
                borderRadius: getBorderRadiusValue(
                  basic.photoConfig || {
                    borderRadius: "none",
                    customBorderRadius: 0,
                  }
                ),
              }}
            >
              <img
                src={basic.photo}
                alt={`${basic.name}'s photo`}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        )}

        <div className="min-w-0">
          {nameField.visible !== false && basic[nameField.key] && (
            <motion.h1
              layout="position"
              className="font-bold leading-tight text-neutral-950 [overflow-wrap:anywhere]"
              style={{ fontSize: "29px" }}
            >
              {basic[nameField.key] as string}
            </motion.h1>
          )}
          {titleField.visible !== false && basic[titleField.key] && (
            <motion.h2
              layout="position"
              className="mt-2 font-medium [overflow-wrap:anywhere]"
              style={{ color: themeColor, fontSize: "15px" }}
            >
              {basic[titleField.key] as string}
            </motion.h2>
          )}
        </div>

        <motion.div
          layout="position"
          className="mt-6 flex flex-col gap-3 text-neutral-800"
          style={{ fontSize: `${Math.max((globalSettings?.baseFontSize || 14) - 1, 10)}px` }}
        >
          {allFields.map((item) => {
            const customFieldHref =
              item.custom && "href" in item && typeof item.href === "string"
                ? item.href
                : null;
            const content = customFieldHref ? (
              <a
                href={customFieldHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 underline [overflow-wrap:anywhere]"
              >
                {item.value}
              </a>
            ) : (
              <span className="min-w-0 [overflow-wrap:anywhere]" suppressHydrationWarning>
                {item.value}
              </span>
            );

            return (
              <motion.div
                key={item.key}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="flex shrink-0 items-center justify-center text-neutral-800">
                  {getIcon(item.icon)}
                </span>
                {content}
              </motion.div>
            );
          })}
        </motion.div>

        {basic.githubContributionsVisible && (
          <GithubContribution
            className="mt-4"
            githubKey={basic.githubKey}
            username={basic.githubUseName}
          />
        )}
      </div>
    </SectionWrapper>
  );
};

export default BaseInfo;
