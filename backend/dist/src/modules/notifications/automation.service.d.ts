import { NotificationsService } from './notifications.service';
type DomainEvent = {
    eventId: string;
    type: string;
    payload: Record<string, unknown>;
};
export declare class AutomationService {
    private readonly notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    publish(event: DomainEvent): Promise<void>;
}
export {};
