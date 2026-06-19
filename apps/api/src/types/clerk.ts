export interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

export interface ClerkUserUpsertEvent {
  type: 'user.created' | 'user.updated';
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ClerkUserDeletedEvent {
  type: 'user.deleted';
  data: {
    id: string;
    deleted: true;
  };
}

export type ClerkWebhookEvent = ClerkUserUpsertEvent | ClerkUserDeletedEvent;
