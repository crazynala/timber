import { Card, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface TitledCardProps {
  title: ReactNode;
  children?: ReactNode;
}

export default function TitledCard({ title, children }: TitledCardProps) {
  return (
    <Card shadow="xs" withBorder p="md" radius="md">
      <Card.Section bg="gray.6" mb="md">
        <Title size="xs" mx="xs" mt={3} mb={2} order={4} m="xs" fw="700" c="white">
          {title}
        </Title>
      </Card.Section>
      {children}
    </Card>
  );
}
