import { useCallback, useState, useEffect } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { useGlobalFormContext } from "./globalFormProvider";
import { Button, Group, Text, Paper } from "@mantine/core";
import { IconAlertSquareRounded } from "@tabler/icons-react";
import classes from "./saveCancelHeader.module.css";

export function SaveCancelHeader() {
  const { isDirty, saveHandlerRef, cancelHandlerRef, registerBlockHandler } = useGlobalFormContext();
  const [pulse, setPulse] = useState(false);

  const closePulse = useDebouncedCallback(() => {
    setPulse(false);
  }, 500);

  const blockHandler = useCallback(() => {
    setPulse(true);
    closePulse();
  }, []);

  useEffect(() => registerBlockHandler(blockHandler), [blockHandler]);
  if (!isDirty) return null;

  return (
    <Paper className={pulse ? classes["shake-and-pulse"] : undefined} w="100%" radius="lg" p={3} bg="gray.9" bd="gray.6" c="white">
      <Group justify="space-between">
        <Group ml="sm">
          <IconAlertSquareRounded />
          <Text size="sm">Unsaved Changes</Text>
        </Group>
        <Group mr="sm">
          <Button
            size="xs"
            color="gray.8"
            radius="lg"
            disabled={!isDirty}
            onClick={() => {
              cancelHandlerRef.current?.();
            }}
          >
            Discard
          </Button>
          <Button size="xs" color="teal" radius="lg" disabled={!isDirty} onClick={saveHandlerRef.current ?? undefined}>
            Save
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
