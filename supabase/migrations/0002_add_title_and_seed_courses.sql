-- ============================================================
-- Migration: Add title column + seed courses
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Add title column to classes table
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

-- 2. Add title column to demo_classes table  
ALTER TABLE public.demo_classes
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

-- 3. Seed the two courses (use ON CONFLICT to skip if already exists)
INSERT INTO public.courses (id, name, description)
VALUES
  ('c-1', 'Full-Stack React & Next.js Masterclass',   'Comprehensive Next.js App Router & Server Components'),
  ('c-2', 'AI Engineering & Agentic Systems',          'LLM Architectures, RAG, and Autonomous Coding Agents')
ON CONFLICT (id) DO NOTHING;

-- Done! ✅
