export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat: {
    id: number;
    type: "private" | "group" | "supergroup" | "channel";
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number; // Unix timestamp
  text?: string;
  entities?: {
    offset: number;
    length: number;
    type:
      | "mention"
      | "hashtag"
      | "cashtag"
      | "bot_command"
      | "url"
      | "email"
      | "phone_number"
      | "bold"
      | "italic"
      | "underline"
      | "strikethrough"
      | "code"
      | "pre"
      | "text_link"
      | "text_mention";
  }[];
  reply_to_message?: TelegramMessage;
  photo?: {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  }[];
  document?: {
    file_id: string;
    file_unique_id: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
  };
  contact?: {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  inline_keyboard?: {
    text: string;
    callback_data: string;
  }[];
}
