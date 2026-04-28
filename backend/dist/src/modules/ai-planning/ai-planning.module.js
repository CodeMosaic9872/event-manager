"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPlanningModule = void 0;
const common_1 = require("@nestjs/common");
const ai_planning_controller_1 = require("./ai-planning.controller");
const ai_planning_service_1 = require("./ai-planning.service");
let AiPlanningModule = class AiPlanningModule {
};
exports.AiPlanningModule = AiPlanningModule;
exports.AiPlanningModule = AiPlanningModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_planning_controller_1.AiPlanningController],
        providers: [ai_planning_service_1.AiPlanningService],
        exports: [ai_planning_service_1.AiPlanningService],
    })
], AiPlanningModule);
//# sourceMappingURL=ai-planning.module.js.map