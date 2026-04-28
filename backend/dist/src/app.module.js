"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const taxonomy_module_1 = require("./modules/taxonomy/taxonomy.module");
const suppliers_module_1 = require("./modules/suppliers/suppliers.module");
const ai_planning_module_1 = require("./modules/ai-planning/ai-planning.module");
const job_board_module_1 = require("./modules/job-board/job-board.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const referrals_module_1 = require("./modules/referrals/referrals.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            taxonomy_module_1.TaxonomyModule,
            suppliers_module_1.SuppliersModule,
            ai_planning_module_1.AiPlanningModule,
            job_board_module_1.JobBoardModule,
            notifications_module_1.NotificationsModule,
            referrals_module_1.ReferralsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map