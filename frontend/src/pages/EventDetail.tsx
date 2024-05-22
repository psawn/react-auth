import { Suspense } from "react";
import {
  useRouteLoaderData,
  json,
  redirect,
  defer,
  Await,
  Params,
} from "react-router-dom";

import EventItem, { TEvent } from "../components/EventItem";
import EventsList from "../components/EventsList";
import { getAuthToken } from "../ultis/auth";

function EventDetailPage() {
  const data = useRouteLoaderData("event-detail") as {
    event: TEvent;
    events: TEvent[];
  };
  const { event, events } = data;

  return (
    <>
      <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
        <Await resolve={event}>
          {(loadedEvent) => <EventItem event={loadedEvent} />}
        </Await>
      </Suspense>
      <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
        <Await resolve={events}>
          {(loadedEvents) => <EventsList events={loadedEvents} />}
        </Await>
      </Suspense>
    </>
  );
}

export default EventDetailPage;

async function loadEvent(id: string) {
  const response = await fetch("http://localhost:8080/events/" + id);

  if (!response.ok) {
    throw json(
      { message: "Could not fetch details for selected event." },
      {
        status: 500,
      }
    );
  } else {
    const resData = await response.json();
    return resData.event;
  }
}

async function loadEvents() {
  const response = await fetch("http://localhost:8080/events");

  if (!response.ok) {
    // return { isError: true, message: 'Could not fetch events.' };
    // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
    //   status: 500,
    // });
    throw json(
      { message: "Could not fetch events." },
      {
        status: 500,
      }
    );
  } else {
    const resData = await response.json();
    return resData.events;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export async function loader({
  // request,
  params,
}: {
  request: Request;
  params: Params;
}) {
  const id = params.eventId;

  return defer({
    event: await loadEvent(id!),
    events: loadEvents(),
  });
}

// eslint-disable-next-line react-refresh/only-export-components
export async function action({
  request,
  params,
}: {
  request: Request;
  params: Params;
}) {
  const eventId = params.eventId;
  const token = getAuthToken();

  const response = await fetch("http://localhost:8080/events/" + eventId, {
    method: request.method,
    headers: { authorization: "Bearer " + token },
  });

  if (!response.ok) {
    throw json({ message: "Could not delete event." }, { status: 500 });
  }

  return redirect("/events");
}
