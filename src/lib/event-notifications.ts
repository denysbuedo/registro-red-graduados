import { db } from "@/db";
import { events, eventAttendees, graduates, notifications, eventNotificationLog } from "@/db/schema";
import { eq, and, lte, gte, isNull, sql, or } from "drizzle-orm";

interface EventWithAttendees {
  id: number;
  title: string;
  date: Date;
  attendees: number[]; // userIds
}

// Check and send event notifications
export async function checkAndSendEventNotifications() {
  try {
    const now = new Date();
    
    // Get all upcoming and recent events (within last 2 hours to next 3 days)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const allEvents = await db
      .select()
      .from(events)
      .where(
        and(
          gte(events.date, twoHoursAgo),
          lte(events.date, threeDaysFromNow)
        )
      )
      .execute();

    for (const event of allEvents) {
      const eventDate = new Date(event.date!);
      const eventId = event.id;

      // Get confirmed attendees
      const attendees = await db
        .select({
          graduateId: eventAttendees.graduateId,
        })
        .from(eventAttendees)
        .where(
          and(
            eq(eventAttendees.eventId, eventId),
            eq(eventAttendees.status, "attending")
          )
        );

      // Get user IDs for attendees
      const attendeeUserIds: number[] = [];
      for (const attendee of attendees) {
        const graduate = await db
          .select({ userId: graduates.userId })
          .from(graduates)
          .where(eq(graduates.id, attendee.graduateId))
          .limit(1);
        
        if (graduate.length > 0 && graduate[0].userId) {
          attendeeUserIds.push(graduate[0].userId);
        }
      }

      if (attendeeUserIds.length === 0) continue;

      // Check which notifications to send
      const sentNotifications = await db
        .select({ type: eventNotificationLog.type })
        .from(eventNotificationLog)
        .where(eq(eventNotificationLog.eventId, eventId));

      const sentTypes = new Set(sentNotifications.map(n => n.type));

      // 3 days before
      const threeDaysBefore = new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      if (now >= threeDaysBefore && !sentTypes.has("3days_before")) {
        await sendNotificationToUsers(
          attendeeUserIds,
          event.title,
          `📅 En 3 días: "${event.title}" - ${eventDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`,
          "/eventos"
        );
        await db.insert(eventNotificationLog).values({ eventId, type: "3days_before" });
      }

      // 15 minutes before
      const fifteenMinBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
      const tenMinBefore = new Date(eventDate.getTime() - 10 * 60 * 1000);
      if (now >= fifteenMinBefore && now < tenMinBefore && !sentTypes.has("15min_before")) {
        await sendNotificationToUsers(
          attendeeUserIds,
          event.title,
          `⏰ En 15 minutos: "${event.title}" está por comenzar`,
          "/eventos"
        );
        await db.insert(eventNotificationLog).values({ eventId, type: "15min_before" });
      }

      // Event starting (within 5 minutes of start)
      const fiveMinAfter = new Date(eventDate.getTime() + 5 * 60 * 1000);
      if (now >= eventDate && now < fiveMinAfter && !sentTypes.has("starting")) {
        await sendNotificationToUsers(
          attendeeUserIds,
          event.title,
          `🔴 ¡Ha comenzado! "${event.title}" ya está en curso`,
          "/eventos"
        );
        await db.insert(eventNotificationLog).values({ eventId, type: "starting" });
      }

      // Event ended (1 hour after start, assuming 1 hour duration)
      const oneHourAfter = new Date(eventDate.getTime() + 60 * 60 * 1000);
      const twoHoursAfter = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
      if (now >= oneHourAfter && now < twoHoursAfter && !sentTypes.has("ended")) {
        await sendNotificationToUsers(
          attendeeUserIds,
          event.title,
          `✅ Finalizado: "${event.title}" ha concluido. ¡Gracias por participar!`,
          "/eventos"
        );
        await db.insert(eventNotificationLog).values({ eventId, type: "ended" });
      }
    }
  } catch (error) {
    console.error("Error in event notification check:", error);
  }
}

async function sendNotificationToUsers(
  userIds: number[],
  eventTitle: string,
  message: string,
  link: string
) {
  for (const userId of userIds) {
    try {
      await db.insert(notifications).values({
        userId,
        type: "post_commented",
        message,
        link,
        read: 0,
      });
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }
}
