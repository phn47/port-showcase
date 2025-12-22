


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_revision"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO revisions (entity_type, entity_id, snapshot, author_id)
  VALUES (
    TG_TABLE_NAME::text,
    NEW.id,
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_revision"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_editor"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
$$;


ALTER FUNCTION "public"."is_admin_or_editor"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_posts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_posts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_services_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_services_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."artwork_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artwork_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text" NOT NULL,
    "storage_key" "text" NOT NULL,
    "width" integer,
    "height" integer,
    "file_size" bigint,
    "alt_text" "text",
    "dominant_color" "text",
    "display_order" integer DEFAULT 0,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "artwork_media_type_check" CHECK (("type" = ANY (ARRAY['image'::"text", 'video'::"text"])))
);


ALTER TABLE "public"."artwork_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artwork_tags" (
    "artwork_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."artwork_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artworks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "year" integer,
    "medium" "text",
    "dimensions" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "artworks_category_check" CHECK (("category" = ANY (ARRAY['Illustration'::"text", 'Animation'::"text", 'Logo'::"text", 'Banner'::"text", 'NFT'::"text", 'Meme'::"text", 'Sticker'::"text", 'Animated Sticker'::"text", 'GIF'::"text", 'Social Media'::"text", 'Comic'::"text"]))),
    CONSTRAINT "artworks_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."artworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text",
    "excerpt" "text",
    "cover_image" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "seo_title" "text",
    "seo_description" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text",
    "featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."revisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "snapshot" "jsonb" NOT NULL,
    "author_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "comment" "text",
    CONSTRAINT "revisions_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['artwork'::"text", 'timeline_entry'::"text", 'service'::"text", 'site_setting'::"text", 'blog_post'::"text"])))
);


ALTER TABLE "public"."revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "featured" boolean DEFAULT false,
    CONSTRAINT "services_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "color" "text" DEFAULT '#000000'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timeline_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date_label" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "media_url" "text",
    "media_alt" "text",
    "display_order" integer DEFAULT 0,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "timeline_entries_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."timeline_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'viewer'::"text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."artwork_media"
    ADD CONSTRAINT "artwork_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artwork_tags"
    ADD CONSTRAINT "artwork_tags_pkey" PRIMARY KEY ("artwork_id", "tag_id");



ALTER TABLE ONLY "public"."artworks"
    ADD CONSTRAINT "artworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artworks"
    ADD CONSTRAINT "artworks_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."revisions"
    ADD CONSTRAINT "revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."timeline_entries"
    ADD CONSTRAINT "timeline_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_artwork_media_artwork_id" ON "public"."artwork_media" USING "btree" ("artwork_id");



CREATE INDEX "idx_artwork_media_display_order" ON "public"."artwork_media" USING "btree" ("display_order");



CREATE INDEX "idx_artwork_media_is_primary" ON "public"."artwork_media" USING "btree" ("is_primary");



CREATE INDEX "idx_artwork_tags_artwork_id" ON "public"."artwork_tags" USING "btree" ("artwork_id");



CREATE INDEX "idx_artwork_tags_tag_id" ON "public"."artwork_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_artworks_category" ON "public"."artworks" USING "btree" ("category");



CREATE INDEX "idx_artworks_display_order" ON "public"."artworks" USING "btree" ("display_order");



CREATE INDEX "idx_artworks_featured" ON "public"."artworks" USING "btree" ("featured");



CREATE INDEX "idx_artworks_metadata" ON "public"."artworks" USING "gin" ("metadata");



CREATE INDEX "idx_artworks_published_at" ON "public"."artworks" USING "btree" ("published_at") WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_artworks_search" ON "public"."artworks" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_artworks_slug" ON "public"."artworks" USING "btree" ("slug");



CREATE INDEX "idx_artworks_status" ON "public"."artworks" USING "btree" ("status");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_actor_id" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_revisions_created_at" ON "public"."revisions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_revisions_entity" ON "public"."revisions" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_services_display_order" ON "public"."services" USING "btree" ("display_order");



CREATE INDEX "idx_services_slug" ON "public"."services" USING "btree" ("slug");



CREATE INDEX "idx_services_status" ON "public"."services" USING "btree" ("status");



CREATE INDEX "idx_tags_name" ON "public"."tags" USING "btree" ("name");



CREATE INDEX "idx_tags_slug" ON "public"."tags" USING "btree" ("slug");



CREATE INDEX "idx_timeline_entries_display_order" ON "public"."timeline_entries" USING "btree" ("display_order");



CREATE INDEX "idx_timeline_entries_published_at" ON "public"."timeline_entries" USING "btree" ("published_at") WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_timeline_entries_status" ON "public"."timeline_entries" USING "btree" ("status");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "posts_created_at_idx" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "posts_slug_idx" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "posts_status_idx" ON "public"."posts" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "create_artwork_revision" AFTER UPDATE ON "public"."artworks" FOR EACH ROW WHEN (("old".* IS DISTINCT FROM "new".*)) EXECUTE FUNCTION "public"."create_revision"();



CREATE OR REPLACE TRIGGER "create_timeline_revision" AFTER UPDATE ON "public"."timeline_entries" FOR EACH ROW WHEN (("old".* IS DISTINCT FROM "new".*)) EXECUTE FUNCTION "public"."create_revision"();



CREATE OR REPLACE TRIGGER "services_updated_at" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_services_updated_at"();



CREATE OR REPLACE TRIGGER "update_artworks_updated_at" BEFORE UPDATE ON "public"."artworks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_posts_updated_at"();



CREATE OR REPLACE TRIGGER "update_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_timeline_entries_updated_at" BEFORE UPDATE ON "public"."timeline_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."artwork_media"
    ADD CONSTRAINT "artwork_media_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_tags"
    ADD CONSTRAINT "artwork_tags_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artwork_tags"
    ADD CONSTRAINT "artwork_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artworks"
    ADD CONSTRAINT "artworks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."artworks"
    ADD CONSTRAINT "artworks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."revisions"
    ADD CONSTRAINT "revisions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."timeline_entries"
    ADD CONSTRAINT "timeline_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."timeline_entries"
    ADD CONSTRAINT "timeline_entries_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and editors can create revisions" ON "public"."revisions" FOR INSERT WITH CHECK ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can manage artwork media" ON "public"."artwork_media" USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can manage artwork tags" ON "public"."artwork_tags" USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can manage artworks" ON "public"."artworks" USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can manage tags" ON "public"."tags" USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can manage timeline entries" ON "public"."timeline_entries" USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can view all artworks" ON "public"."artworks" FOR SELECT USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can view all timeline entries" ON "public"."timeline_entries" FOR SELECT USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins and editors can view revisions" ON "public"."revisions" FOR SELECT USING ("public"."is_admin_or_editor"());



CREATE POLICY "Admins can delete posts" ON "public"."posts" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Admins can insert posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Admins can manage users" ON "public"."users" USING ("public"."is_admin"());



CREATE POLICY "Admins can update posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can update site settings" ON "public"."site_settings" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can view all posts" ON "public"."posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Allow authenticated users to delete services" ON "public"."services" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert services" ON "public"."services" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read all services" ON "public"."services" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update services" ON "public"."services" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public read access to published services" ON "public"."services" FOR SELECT TO "authenticated", "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "Public can view artwork tags" ON "public"."artwork_tags" FOR SELECT USING (true);



CREATE POLICY "Public can view published artwork media" ON "public"."artwork_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."artworks"
  WHERE (("artworks"."id" = "artwork_media"."artwork_id") AND ("artworks"."status" = 'published'::"text")))));



CREATE POLICY "Public can view published artworks" ON "public"."artworks" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Public can view published posts" ON "public"."posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Public can view published timeline entries" ON "public"."timeline_entries" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Public can view site settings" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "Public can view tags" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Public can view user profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."artwork_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artwork_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artworks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."revisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timeline_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_revision"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_revision"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_revision"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_editor"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_editor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_editor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_posts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_posts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_posts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."artwork_media" TO "anon";
GRANT ALL ON TABLE "public"."artwork_media" TO "authenticated";
GRANT ALL ON TABLE "public"."artwork_media" TO "service_role";



GRANT ALL ON TABLE "public"."artwork_tags" TO "anon";
GRANT ALL ON TABLE "public"."artwork_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."artwork_tags" TO "service_role";



GRANT ALL ON TABLE "public"."artworks" TO "anon";
GRANT ALL ON TABLE "public"."artworks" TO "authenticated";
GRANT ALL ON TABLE "public"."artworks" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."revisions" TO "anon";
GRANT ALL ON TABLE "public"."revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."revisions" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."timeline_entries" TO "anon";
GRANT ALL ON TABLE "public"."timeline_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."timeline_entries" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































