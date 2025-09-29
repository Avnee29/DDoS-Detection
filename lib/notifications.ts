// Real-time notification system for DDoS detection
export interface NotificationConfig {
  email: boolean
  sms: boolean
  webhook: boolean
  slack: boolean
}

export interface NotificationPayload {
  type: "alert" | "incident" | "system"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  metadata?: Record<string, any>
}

class NotificationService {
  private config: NotificationConfig = {
    email: true,
    sms: true,
    webhook: true,
    slack: false,
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    console.log(`[v0] Sending ${payload.severity} notification: ${payload.title}`)

    // Email notifications
    if (this.config.email) {
      await this.sendEmail(payload)
    }

    // SMS notifications for critical alerts
    if (this.config.sms && payload.severity === "critical") {
      await this.sendSMS(payload)
    }

    // Webhook notifications
    if (this.config.webhook) {
      await this.sendWebhook(payload)
    }

    // Slack notifications
    if (this.config.slack) {
      await this.sendSlack(payload)
    }
  }

  private async sendEmail(payload: NotificationPayload): Promise<void> {
    // Simulate email sending
    console.log(`[v0] Email sent: ${payload.title}`)

    // In a real implementation, you would integrate with:
    // - SendGrid, AWS SES, or similar email service
    // - Template system for different alert types
    // - Recipient management based on severity and team assignments
  }

  private async sendSMS(payload: NotificationPayload): Promise<void> {
    // Simulate SMS sending
    console.log(`[v0] SMS sent: ${payload.title}`)

    // In a real implementation, you would integrate with:
    // - Twilio, AWS SNS, or similar SMS service
    // - On-call rotation system
    // - Rate limiting to prevent SMS spam
  }

  private async sendWebhook(payload: NotificationPayload): Promise<void> {
    // Simulate webhook sending
    console.log(`[v0] Webhook sent: ${payload.title}`)

    // In a real implementation, you would:
    // - POST to configured webhook URLs
    // - Include authentication headers
    // - Implement retry logic with exponential backoff
    // - Support multiple webhook destinations
  }

  private async sendSlack(payload: NotificationPayload): Promise<void> {
    // Simulate Slack notification
    console.log(`[v0] Slack notification sent: ${payload.title}`)

    // In a real implementation, you would:
    // - Use Slack Web API or Incoming Webhooks
    // - Format messages with rich attachments
    // - Support different channels based on severity
    // - Include action buttons for quick response
  }

  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): NotificationConfig {
    return { ...this.config }
  }
}

export const notificationService = new NotificationService()

// Auto-notification triggers for DDoS events
export async function triggerDDoSAlert(
  attackType: string,
  sourceIPs: string[],
  targetSystems: string[],
  severity: "critical" | "high" | "medium" | "low",
): Promise<void> {
  await notificationService.sendNotification({
    type: "alert",
    severity,
    title: `DDoS Attack Detected: ${attackType}`,
    message: `Attack from ${sourceIPs.length} IPs targeting ${targetSystems.join(", ")}`,
    metadata: {
      attackType,
      sourceIPs,
      targetSystems,
      timestamp: new Date().toISOString(),
    },
  })
}

export async function triggerSystemAlert(
  system: string,
  issue: string,
  severity: "critical" | "high" | "medium" | "low",
): Promise<void> {
  await notificationService.sendNotification({
    type: "system",
    severity,
    title: `System Alert: ${system}`,
    message: issue,
    metadata: {
      system,
      issue,
      timestamp: new Date().toISOString(),
    },
  })
}
