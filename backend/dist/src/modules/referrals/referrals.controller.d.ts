import { ReferralsService } from './referrals.service';
export declare class ReferralsController {
    private readonly referralsService;
    constructor(referralsService: ReferralsService);
    link(supplierId: string): {
        supplierId: string;
        code: string;
        url: string;
    };
    regenerate(supplierId: string): {
        supplierId: string;
        code: string;
        url: string;
    };
    attributions(supplierId: string): {
        supplierId: string;
        attributions: never[];
    };
    rewards(supplierId: string): {
        supplierId: string;
        rewards: never[];
    };
}
export declare class AdminReferralsController {
    list(): {
        referrals: never[];
    };
    patchReward(id: string): {
        id: string;
        updated: boolean;
    };
}
