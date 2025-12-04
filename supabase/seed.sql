-- This is the seed file for the Supabase database
-- It will be executed when running `supabase db reset` or `supabase start`

-- Ensure the schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- Create tables for the application

-- Users table (will be used when auth is implemented)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::JSONB
);

-- Comments to help understand the table structure:
-- The profiles table will be linked to the auth.users table provided by Supabase Auth.
-- Each user can have preferences stored as JSONB, which could include dietary restrictions, 
-- favorite cuisines, etc.

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL,
    instructions JSONB NOT NULL,
    cuisine_type TEXT,
    prep_time TEXT,
    cook_time TEXT,
    servings TEXT,
    dietary_restrictions JSONB DEFAULT '[]'::JSONB,
    is_favorite BOOLEAN DEFAULT false,
    image_url TEXT,
    user_notes TEXT
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::JSONB,
    related_recipe_id UUID REFERENCES public.recipes(id),
    color TEXT,
    is_pinned BOOLEAN DEFAULT false
);

-- Table for storing recipe categorization
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES public.profiles(id),
    icon TEXT
);

-- Junction table for recipe-category relationship
CREATE TABLE IF NOT EXISTS public.recipe_categories (
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, category_id)
);

-- RLS (Row Level Security) Policies
-- These ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts if script is re-run
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Allow public read access" ON public.recipes; -- Drop the new one too, just in case
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view their own recipe categories" ON public.recipe_categories;
DROP POLICY IF EXISTS "Users can create their own recipe categories" ON public.recipe_categories;
DROP POLICY IF EXISTS "Users can delete their own recipe categories" ON public.recipe_categories;


-- Create policies
-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes: Allow public read access for now (MVP without auth)
-- Later, this might be changed back or adjusted based on public/private recipes
CREATE POLICY "Allow public read access"
    ON public.recipes FOR SELECT USING (true);

-- Policies for authenticated users (will apply when auth is implemented)
CREATE POLICY "Users can create their own recipes"
    ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
    ON public.recipes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" 
    ON public.recipes FOR DELETE USING (auth.uid() = user_id);

-- Notes: users can CRUD their own notes
CREATE POLICY "Users can view their own notes" 
    ON public.notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
    ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
    ON public.notes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
    ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Categories: users can CRUD their own categories
CREATE POLICY "Users can view their own categories" 
    ON public.categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
    ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
    ON public.categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
    ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Recipe categories: users can CRUD their own recipe category assignments
CREATE POLICY "Users can view their own recipe categories" 
    ON public.recipe_categories FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own recipe categories" 
    ON public.recipe_categories FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own recipe categories" 
    ON public.recipe_categories FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_id AND user_id = auth.uid()
        )
    );

-- Create function to update the "updated_at" column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the "updated_at" column
CREATE TRIGGER update_profiles_modified
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recipes_modified
BEFORE UPDATE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_notes_modified
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_categories_modified
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
