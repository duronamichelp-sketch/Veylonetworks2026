'use client';
import VeyloApp from '../page';

// Guest and registered members use the exact same page components.
// Guest actions are backed by a separate, in-memory fictional dataset.
export default function GuestPreview(){
  return <VeyloApp guestMode />;
}
