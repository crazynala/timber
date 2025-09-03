import { Link, useLocation } from "@remix-run/react";
import { Breadcrumbs, Anchor, Text } from "@mantine/core";
import type { ReactNode } from "react";

export type BreadcrumbItem = { label?: ReactNode; title?: string; href: string };
export default function BreadcrumbSet({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  if (!breadcrumbs) return null;
  const location = useLocation();
  const renderBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    const label: ReactNode = breadcrumb.label ?? breadcrumb.title ?? "";
    const isLink = breadcrumb.href !== "#";
    return isLink ? (
      <Anchor component={Link} to={`${breadcrumb.href}${location.search}`} key={breadcrumb.href}>
        {label}
      </Anchor>
    ) : (
      <Text size="xl" fw="bold" key={breadcrumb.href}>
        {label}
      </Text>
    );
  };
  return <Breadcrumbs separatorMargin="sm">{breadcrumbs.map((b) => renderBreadcrumb(b))}</Breadcrumbs>;
}
