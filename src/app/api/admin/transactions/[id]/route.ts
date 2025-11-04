import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/transactions/:id
 * Get a single transaction by ID (Admin only)
 * 
 * This endpoint requires admin authentication via Bearer token.
 * Returns transaction details including user information and investment opportunity details.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params;

    // Validate transaction ID
    if (!transactionId) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Transaction ID is required",
        },
        { status: 400 }
      );
    }

    // Validate UUID format (optional but recommended)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(transactionId)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid transaction ID format",
        },
        { status: 400 }
      );
    }

    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Missing or invalid authorization token",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify admin token
    // TODO: Implement token verification with your auth service
    // Example with JWT verification:
    /*
    import jwt from 'jsonwebtoken';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        return NextResponse.json(
          { error: "Forbidden", message: "Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    */

    // Fetch transaction from database
    // TODO: Replace with your actual database query
    // Example with Prisma:
    /*
    import { prisma } from '@/lib/prisma';
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        investmentOpportunity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    */

    // Example with Sequelize:
    /*
    import { Transaction, User, InvestmentOpportunity } from '@/models';
    const transaction = await Transaction.findOne({
      where: { id: transactionId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: InvestmentOpportunity,
          attributes: ['id', 'title'],
        },
      ],
    });
    */

    // Example with raw SQL:
    /*
    import { db } from '@/lib/db';
    const [rows] = await db.query(
      `SELECT 
        t.id,
        t.user_id as userId,
        t.investment_opportunity_id as investmentOpportunityId,
        t.amount,
        t.status,
        t.payment_method as paymentMethod,
        t.date,
        t.bonds,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        io.id as investment_opportunity_id,
        io.title as investment_opportunity_title
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN investment_opportunities io ON t.investment_opportunity_id = io.id
      WHERE t.id = ?`,
      [transactionId]
    );
    const transaction = rows[0];
    */

    // For development/testing: Return mock data
    // Remove this in production and use actual database query above
    const transaction = {
      id: transactionId,
      userId: "user-123",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      investmentOpportunityId: "investment-opportunity-456",
      investmentOpportunityTitle: "Green Energy Bonds 2024",
      amount: 10000,
      status: "pending",
      paymentMethod: "bank_transfer",
      date: new Date().toISOString(),
      bonds: 100,
    };

    // Check if transaction exists
    if (!transaction) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `No transaction found with ID: ${transactionId}`,
        },
        { status: 404 }
      );
    }

    // Transform to match expected response format
    // Handle both flat and nested structures
    const response = {
      id: transaction.id,
      userId: transaction.userId || (transaction as any).user?.id || "",
      userName: (transaction as any).userName || (transaction as any).user?.name || "",
      userEmail: (transaction as any).userEmail || (transaction as any).user?.email || "",
      investmentOpportunityId:
        (transaction as any).investmentOpportunityId ||
        (transaction as any).investmentOpportunity?.id ||
        "",
      investmentOpportunityTitle:
        (transaction as any).investmentOpportunityTitle ||
        (transaction as any).investmentOpportunity?.title ||
        "",
      amount: transaction.amount,
      status: transaction.status,
      paymentMethod: (transaction as any).paymentMethod || null,
      date: transaction.date || (transaction as any).createdAt || new Date().toISOString(),
      bonds: (transaction as any).bonds || null,
    };

    // Return transaction data
    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message || "An error occurred while fetching the transaction",
      },
      { status: 500 }
    );
  }
}

