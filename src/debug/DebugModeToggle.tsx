import { Switch, Tooltip, Group } from "@mantine/core";
import { IconBug } from "@tabler/icons-react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

interface DebugModeToggleProps {
  initialValue?: boolean;
}
export function DebugModeToggle({ initialValue = false }: DebugModeToggleProps) {
  const fetcher = useFetcher<{ debugMode: boolean }>();
  const [checked, setChecked] = useState(initialValue);
  useEffect(() => {
    if (fetcher.data) setChecked(fetcher.data.debugMode);
  }, [fetcher.data]);
  return (
    <fetcher.Form method="post" action="/api/toggle-debug">
      <Tooltip label={checked ? "Debug Mode: ON" : "Debug Mode: OFF"} position="bottom">
        <Group gap="xs">
          <Switch
            color="gray.7"
            size="xs"
            checked={checked}
            onChange={(e) => {
              setChecked(e.currentTarget.checked);
              fetcher.submit({}, { method: "POST", action: "/api/toggle-debug" });
            }}
            onLabel={<IconBug size="1rem" color="red" />}
            offLabel={<IconBug size="1rem" color="gray" />}
          />
        </Group>
      </Tooltip>
    </fetcher.Form>
  );
}
