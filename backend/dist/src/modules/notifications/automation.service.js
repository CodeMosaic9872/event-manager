"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
let AutomationService = AutomationService_1 = class AutomationService {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(AutomationService_1.name);
    }
    async publish(event) {
        this.logger.log(`automation.event ${event.type} ${event.eventId}`);
        if (event.type === 'job.application.submitted') {
            await this.notificationsService.enqueueEmail({
                recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
                templateKey: 'job.application.submitted',
                data: event.payload,
            });
        }
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map