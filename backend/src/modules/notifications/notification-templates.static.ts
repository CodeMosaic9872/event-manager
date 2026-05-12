import type { NotificationChannel } from '@prisma/client';
import { notificationEmailShell } from './email-html-layout';

/**
 * All notification copy lives here (not in DB). Same {{placeholder}} syntax as renderTemplate().
 * Email HTML: optional `htmlFragment` is wrapped with the standard shell unless you pass a full document (starts with <!DOCTYPE or <html).
 */
type EmailDef = {
  subject: string;
  body: string;
  /** Inner HTML (title + paragraphs). Wrapped via notificationEmailShell. */
  htmlFragment?: string;
};

type PushDef = {
  subject: string;
  body: string;
};

type SmsDef = {
  body: string;
};

type ChannelBundle = {
  EMAIL?: EmailDef;
  PUSH?: PushDef;
  SMS?: SmsDef;
};

export type ResolvedStaticTemplate = {
  subjectTemplate: string | null;
  bodyTemplate: string;
  bodyHtmlTemplate: string | null;
  isActive: boolean;
};

const STATIC_TEMPLATES: Record<string, ChannelBundle> = {
  'job.application.submitted': {
    EMAIL: {
      subject: 'New application for "{{jobTitle}}"',
      body:
        '{{supplierName}} applied to your job "{{jobTitle}}" (application {{applicationId}}). Open the job board to review candidates.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">New application for "{{jobTitle}}"</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;"><strong>{{supplierName}}</strong> applied to your job <strong>"{{jobTitle}}"</strong>. Application ID: <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;">{{applicationId}}</code>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Open the job board in Event Marketplace to review candidates.</p>`,
    },
    PUSH: {
      subject: 'New application',
      body: '{{supplierName}} applied to "{{jobTitle}}".',
    },
    SMS: {
      body: 'Event Marketplace: {{supplierName}} applied to your job "{{jobTitle}}".',
    },
  },

  'job.material.updated': {
    EMAIL: {
      subject: 'Job "{{jobTitle}}" was updated',
      body:
        'A job you applied to ("{{jobTitle}}") was updated. Review the latest details in Event Marketplace.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Job "{{jobTitle}}" was updated</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">A job you applied to (<strong>"{{jobTitle}}"</strong>) was updated.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Review the latest details in Event Marketplace.</p>`,
    },
    PUSH: {
      subject: 'Job updated',
      body: '"{{jobTitle}}" was updated — check the listing.',
    },
    SMS: {
      body: 'Event Marketplace: job "{{jobTitle}}" was updated. Sign in to review.',
    },
  },

  'job.matching.published': {
    EMAIL: {
      subject: 'New job matches your categories: "{{jobTitle}}"',
      body:
        'A new job was published that may fit your profile: "{{jobTitle}}" (job {{jobId}}). Apply before spots fill.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">New job: "{{jobTitle}}"</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">A new job was published that may fit your profile. Job ID: <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;">{{jobId}}</code>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Apply in Event Marketplace before spots fill.</p>`,
    },
    PUSH: {
      subject: 'New job opportunity',
      body: 'New job: "{{jobTitle}}" — open the job board to apply.',
    },
    SMS: {
      body: 'Event Marketplace: new job "{{jobTitle}}" matches your profile.',
    },
  },

  'user.welcome': {
    EMAIL: {
      subject: 'Welcome to Event Marketplace',
      body:
        'Hi {{email}}, welcome to Event Marketplace. Start exploring suppliers and build your event plan today.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Welcome, {{email}}</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Thanks for joining Event Marketplace. Start exploring suppliers and build your event plan today.</p>`,
    },
    PUSH: {
      subject: 'Welcome',
      body: 'Welcome to Event Marketplace — discover suppliers for your event.',
    },
    SMS: {
      body: 'Welcome to Event Marketplace! Explore suppliers and job posts anytime.',
    },
  },

  'supplier.onboarding.abandoned': {
    EMAIL: {
      subject: 'Finish your supplier profile',
      body:
        'Your onboarding is {{completionPercent}}% complete at step "{{stepKey}}". Come back to complete your profile and start receiving leads.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Finish your supplier profile</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Your onboarding is <strong>{{completionPercent}}%</strong> complete at step <strong>"{{stepKey}}"</strong>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Come back to complete your profile and start receiving leads.</p>`,
    },
    PUSH: {
      subject: 'Complete your profile',
      body: 'You left onboarding at {{completionPercent}}% — finish to go live.',
    },
    SMS: {
      body:
        'Event Marketplace: complete your supplier registration ({{completionPercent}}% done) to start receiving leads.',
    },
  },

  'supplier.approved': {
    EMAIL: {
      subject: 'Your supplier profile is approved',
      body:
        'Good news — "{{businessName}}" is approved on Event Marketplace. You can now receive leads and appear in search.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">You are approved</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Good news — <strong>"{{businessName}}"</strong> is approved on Event Marketplace.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">You can now receive leads and appear in search.</p>`,
    },
    PUSH: {
      subject: 'Profile approved',
      body: '"{{businessName}}" is approved. You are live on Event Marketplace.',
    },
    SMS: {
      body: 'Event Marketplace: your supplier "{{businessName}}" is approved.',
    },
  },

  'supplier.rejected': {
    EMAIL: {
      subject: 'Supplier profile update',
      body:
        'Your supplier application for "{{businessName}}" was not approved. Reason: {{reason}}. Contact support if you have questions.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Application not approved</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Your supplier application for <strong>"{{businessName}}"</strong> was not approved.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Reason: <strong>{{reason}}</strong>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Contact support if you have questions.</p>`,
    },
    PUSH: {
      subject: 'Application update',
      body: '"{{businessName}}" was not approved. Reason: {{reason}}',
    },
    SMS: {
      body: 'Event Marketplace: "{{businessName}}" not approved. Check email for details.',
    },
  },

  'user.ai.limit.reminder': {
    EMAIL: {
      subject: 'Create an account to keep chatting',
      body:
        'You are approaching the free AI message limit ({{messageCount}} messages used). Register to continue planning your event without interruption.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Create an account to keep chatting</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">You have used <strong>{{messageCount}}</strong> AI messages and are approaching the free limit.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Register to continue planning your event without interruption.</p>`,
    },
    PUSH: {
      subject: 'AI limit approaching',
      body: 'Create an account soon to keep using the planning assistant.',
    },
    SMS: {
      body: 'Event Marketplace: register to keep using the AI planner after your free messages.',
    },
  },

  'user.favorites.followup': {
    EMAIL: {
      subject: 'Still interested in your saved suppliers?',
      body:
        'You saved suppliers on Event Marketplace — log in to compare, contact, or post a job that fits.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Follow up on saved suppliers</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">You saved suppliers on Event Marketplace — log in to compare, contact, or post a job that fits.</p>`,
    },
    PUSH: {
      subject: 'Follow up on favorites',
      body: 'Review suppliers you saved and contact them or publish a job.',
    },
    SMS: {
      body: 'Event Marketplace: follow up on suppliers you saved — log in to continue.',
    },
  },

  'job.draft.reminder': {
    EMAIL: {
      subject: 'Finish publishing your job post',
      body:
        'You have a draft job "{{jobTitle}}" waiting to publish. Complete it so suppliers can apply.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Finish publishing your job</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">You have a draft job <strong>"{{jobTitle}}"</strong> waiting to publish.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Complete it so suppliers can apply.</p>`,
    },
    PUSH: {
      subject: 'Draft job waiting',
      body: 'Publish "{{jobTitle}}" so suppliers can respond.',
    },
    SMS: {
      body: 'Event Marketplace: finish publishing your draft job "{{jobTitle}}".',
    },
  },

  'supplier.subscription.due': {
    EMAIL: {
      subject: 'Subscription renewal coming up',
      body:
        'Your supplier subscription renews on {{nextBillingAt}} for {{amount}} {{currency}}. Ensure your payment method is up to date.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Subscription renewal coming up</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Your supplier subscription renews on <strong>{{nextBillingAt}}</strong>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Amount: <strong>{{amount}} {{currency}}</strong>. Ensure your payment method is up to date.</p>`,
    },
    PUSH: {
      subject: 'Renewal soon',
      body: 'Subscription renews {{nextBillingAt}} — check billing details.',
    },
    SMS: {
      body: 'Event Marketplace: subscription renews {{nextBillingAt}} ({{amount}} {{currency}}).',
    },
  },

  'admin.digest.incomplete': {
    EMAIL: {
      subject: 'Incomplete supplier drafts — summary',
      body:
        'There are {{incompleteDraftCount}} incomplete supplier draft profile(s) in Event Marketplace. Review them in the admin dashboard.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Incomplete supplier drafts</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">There are <strong>{{incompleteDraftCount}}</strong> incomplete supplier draft profile(s) in Event Marketplace.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Review them in the admin dashboard.</p>`,
    },
  },

  /** Supplier: favorite, profile share, or job owner shortlisted their application (PRD “lead”). */
  'supplier.lead.received': {
    EMAIL: {
      subject: 'New lead on Event Marketplace',
      body:
        '{{leadSummary}} Open your dashboard to respond. (Source: {{leadSourceLabel}})',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">New lead</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">{{leadSummary}}</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Source: <strong>{{leadSourceLabel}}</strong>.</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Open your supplier dashboard in Event Marketplace to follow up.</p>`,
    },
    PUSH: {
      subject: 'New lead',
      body: '{{leadShort}} ({{leadSourceLabel}})',
    },
    SMS: {
      body: 'Event Marketplace: new lead for "{{businessName}}". {{leadShort}} Source: {{leadSourceLabel}}.',
    },
  },

  /** User viewed a supplier profile (share tracking) but has not saved them — follow-up (PRD 16.1). Logged-in users only. */
  'user.supplier.view.followup': {
    EMAIL: {
      subject: 'Still considering "{{supplierName}}"?',
      body:
        'You recently viewed "{{supplierName}}" on Event Marketplace. Save them to your favorites or post a job to move forward.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Follow up on "{{supplierName}}"</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">You recently viewed this supplier. Save them to your favorites or publish a job to connect.</p>`,
    },
    PUSH: {
      subject: 'Follow up',
      body: 'You viewed "{{supplierName}}" — save or post a job to connect.',
    },
    SMS: {
      body: 'Event Marketplace: follow up on "{{supplierName}}" — save them or post a job.',
    },
  },

  /** End-user account nudge (PRD inactivity). */
  'user.inactivity.reminder': {
    EMAIL: {
      subject: 'We miss you on Event Marketplace',
      body:
        'It has been a while since your last visit. Log in to discover suppliers, jobs, and planning tools.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Come back when you are ready</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Log in to discover suppliers, new jobs, and AI planning tools.</p>`,
    },
    PUSH: {
      subject: 'Your event marketplace',
      body: 'Log in to see new suppliers and job posts.',
    },
    SMS: {
      body: 'Event Marketplace: log in again to discover suppliers and jobs.',
    },
  },

  /** Approved supplier with no recent applications / stale profile (PRD supplier inactivity). */
  'supplier.inactivity.reminder': {
    EMAIL: {
      subject: 'Stay visible on Event Marketplace',
      body:
        'Your supplier profile "{{businessName}}" has been quiet lately. Update your listing or browse new job posts to win work.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Stay active</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Keep <strong>"{{businessName}}"</strong> visible — refresh your profile and check new job posts.</p>`,
    },
    PUSH: {
      subject: 'Stay active',
      body: 'Browse new jobs or refresh "{{businessName}}" to stay competitive.',
    },
    SMS: {
      body: 'Event Marketplace: refresh "{{businessName}}" and check new job posts.',
    },
  },

  'admin.digest.leads': {
    EMAIL: {
      subject: 'Lead activity — 24h summary',
      body:
        'In the last 24 hours: {{favoritesCount}} new favorite(s), {{shareEventsCount}} profile share event(s). Review engagement in the admin dashboard.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Lead activity (24h)</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">New favorites: <strong>{{favoritesCount}}</strong></p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Profile share events: <strong>{{shareEventsCount}}</strong></p>`,
    },
  },

  'admin.digest.inactive_suppliers': {
    EMAIL: {
      subject: 'Inactive suppliers — summary',
      body:
        '{{inactiveSupplierCount}} approved supplier(s) show no job applications in the recent window and may need outreach.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">Inactive suppliers</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Count (heuristic): <strong>{{inactiveSupplierCount}}</strong></p>`,
    },
  },

  /** PRD admin “unusual AI usage” / failure spike proxy. */
  'admin.alert.ai.failures': {
    EMAIL: {
      subject: 'AI recommendation failures spike',
      body:
        'Detected {{failureCount}} AI recommendation failure log(s) in the last {{windowHours}} hour(s). Review AI monitoring in admin.',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">AI failures alert</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Failures logged: <strong>{{failureCount}}</strong> (last {{windowHours}}h).</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">Review AI monitoring and logs in the admin dashboard.</p>`,
    },
  },

  /** PRD admin “system issue” — generic ops alert (enqueue manually or from monitoring). */
  'admin.alert.system': {
    EMAIL: {
      subject: '{{severity}}: {{title}}',
      body: '{{detail}}',
      htmlFragment: `<h1 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#18181b;">{{title}}</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3f3f46;">{{detail}}</p>`,
    },
  },

  'seed.sms.reminder': {
    SMS: {
      body: 'Reminder: {{message}}',
    },
  },

  'seed.push.alert': {
    PUSH: {
      subject: '{{title}}',
      body: '{{body}}',
    },
  },
};

function wrapHtmlFragment(fragment: string): string {
  const t = fragment.trim();
  if (t.startsWith('<!DOCTYPE') || t.startsWith('<html')) {
    return t;
  }
  return notificationEmailShell(t);
}

/** Resolve copy for dispatch. WHATSAPP is not supported here. */
export function getStaticNotificationTemplate(
  templateKey: string,
  channel: NotificationChannel,
): ResolvedStaticTemplate | null {
  if (channel === 'WHATSAPP') {
    return null;
  }

  const bundle = STATIC_TEMPLATES[templateKey];
  if (!bundle) {
    return null;
  }

  if (channel === 'EMAIL') {
    const e = bundle.EMAIL;
    if (!e) {
      return null;
    }
    return {
      subjectTemplate: e.subject,
      bodyTemplate: e.body,
      bodyHtmlTemplate: e.htmlFragment ? wrapHtmlFragment(e.htmlFragment) : null,
      isActive: true,
    };
  }

  if (channel === 'PUSH') {
    const p = bundle.PUSH;
    if (!p) {
      return null;
    }
    return {
      subjectTemplate: p.subject,
      bodyTemplate: p.body,
      bodyHtmlTemplate: null,
      isActive: true,
    };
  }

  const s = bundle.SMS;
  if (!s) {
    return null;
  }
  return {
    subjectTemplate: null,
    bodyTemplate: s.body,
    bodyHtmlTemplate: null,
    isActive: true,
  };
}

export function listStaticNotificationTemplateKeys(): string[] {
  return Object.keys(STATIC_TEMPLATES).sort((a, b) => a.localeCompare(b));
}
