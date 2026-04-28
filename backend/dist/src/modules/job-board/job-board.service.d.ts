import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../notifications/automation.service';
export declare class JobBoardService {
    private readonly prisma;
    private readonly automationService;
    constructor(prisma: PrismaService, automationService: AutomationService);
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
    createJob(payload: {
        userId: string;
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
    updateJob(jobId: string, userId: string, patch: Partial<{
        title: string;
        description: string;
        eventDate: string;
    }>): Promise<{
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
    publishJob(jobId: string, userId: string): Promise<{
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
    closeJob(jobId: string, userId: string): Promise<{
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
    listUserJobs(userId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    apply(jobId: string, supplierId: string, message?: string): Promise<{
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    }>;
    applyForUser(jobId: string, userId: string, message?: string): Promise<{
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    }>;
    listApplications(jobId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    updateApplicationStatus(id: string, status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN'): Promise<{
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobApplicationStatus;
        supplierId: string;
        message: string | null;
        submittedAt: Date;
        jobPostId: string;
    }>;
}
