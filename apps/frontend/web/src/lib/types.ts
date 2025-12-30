export type Message =
  | {
      text: string;
      role: "user";
    }
  | {
      text: string;
      role: "assistant";
      references: string[];
    };
