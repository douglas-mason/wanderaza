import { userQueryService } from '../query-services/userQueryService';
import type { ClerkUserDeletedEvent, ClerkUserUpsertEvent } from '../types/clerk';

export async function handleUserCreatedOrUpdated(data: ClerkUserUpsertEvent['data']) {
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  if (!primaryEmail) return;

  const nameParts = [data.first_name, data.last_name].filter(
    (part): part is string => Boolean(part)
  );

  await userQueryService.upsertUserByClerkId({
    clerkId: data.id,
    email: primaryEmail.email_address,
    displayName: nameParts.length > 0 ? nameParts.join(' ') : null,
  });
}

export async function handleUserDeleted(data: ClerkUserDeletedEvent['data']) {
  await userQueryService.deleteUserByClerkId(data.id);
}
