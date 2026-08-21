import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create tables if they don't exist using raw SQL
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ClassType" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "grade" TEXT NOT NULL,
        "hourlyRate" DOUBLE PRECISION NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#6366f1',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TeachingSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "classTypeId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "hours" DOUBLE PRECISION NOT NULL,
        "income" DOUBLE PRECISION NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TeachingSession_classTypeId_fkey" FOREIGN KEY ("classTypeId") REFERENCES "ClassType"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TIMESTAMP(3) NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Investment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currentValue" DOUBLE PRECISION NOT NULL,
        "purchaseDate" TIMESTAMP(3) NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `)

    return NextResponse.json({ success: true, message: 'Database tables ready' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
