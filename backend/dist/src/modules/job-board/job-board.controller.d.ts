import { JobBoardService } from './job-board.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
export declare class JobBoardController {
    private readonly jobBoardService;
    constructor(jobBoardService: JobBoardService);
    listPublicJobs(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }[]>;
    createJob(user: AuthUser | undefined, body: {
        title: string;
        description: string;
        eventDate?: string;
        eventTypeId?: string;
        locationText?: string;
        budgetMin?: number;
        budgetMax?: number;
        guestCount?: number;
    }): import(".prisma/client").Prisma.Prisma__JobPostClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    patchJob(user: AuthUser | undefined, id: string, body: {
        title?: string;
        description?: string;
        eventDate?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }>;
    publish(user: AuthUser | undefined, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }>;
    close(user: AuthUser | undefined, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }>;
    apply(user: AuthUser | undefined, id: string, body: {
        message?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    }>;
    applications(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        supplier: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            ownerUserId: string;
            businessName: string;
            slug: string;
            description: string | null;
            approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
            isVerified: boolean;
            ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
            ratingCount: number;
        };
    } & {
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    })[]>;
}
export declare class JobApplicationController {
    private readonly jobBoardService;
    constructor(jobBoardService: JobBoardService);
    updateStatus(id: string, body: {
        status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN';
    }): Promise<{
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    }>;
}
export declare class JobQueryController {
    private readonly jobBoardService;
    constructor(jobBoardService: JobBoardService);
    userJobs(user: AuthUser | undefined): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventTypeId: string | null;
        status: import(".prisma/client").$Enums.JobStatus;
        ownerUserId: string;
        description: string;
        title: string;
        eventDate: Date | null;
        locationText: string | null;
        budgetMin: number | null;
        budgetMax: number | null;
        guestCount: number | null;
        publishedAt: Date | null;
    }[]>;
    supplierRecommendedJobs(supplierId: string): {
        supplierId: string;
        jobs: never[];
        note: string;
    };
}
