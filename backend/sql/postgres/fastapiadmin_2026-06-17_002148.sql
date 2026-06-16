--
-- PostgreSQL database dump
--

\restrict 9qExZeqqbdUYt6emtfQgYjzUgI8DjpcaY12XCXlE27m3yq2zeOHxmNos5PWNVpi

-- Dumped from database version 17.5 (ServBay)
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: apscheduler_jobs; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.apscheduler_jobs (
    id character varying(191) NOT NULL,
    next_run_time double precision,
    job_state bytea NOT NULL
);


ALTER TABLE public.apscheduler_jobs OWNER TO root;

--
-- Name: example_demo; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.example_demo (
    name character varying(64) NOT NULL,
    int_val integer,
    bigint_val bigint,
    float_val double precision,
    bool_val boolean NOT NULL,
    date_val date,
    time_val time without time zone,
    datetime_val timestamp without time zone,
    text_val text,
    json_val json,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.example_demo OWNER TO root;

--
-- Name: TABLE example_demo; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.example_demo IS '示例表';


--
-- Name: COLUMN example_demo.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.name IS '名称';


--
-- Name: COLUMN example_demo.int_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.int_val IS '整数';


--
-- Name: COLUMN example_demo.bigint_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.bigint_val IS '大整数';


--
-- Name: COLUMN example_demo.float_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.float_val IS '浮点数';


--
-- Name: COLUMN example_demo.bool_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.bool_val IS '布尔型';


--
-- Name: COLUMN example_demo.date_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.date_val IS '日期';


--
-- Name: COLUMN example_demo.time_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.time_val IS '时间';


--
-- Name: COLUMN example_demo.datetime_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.datetime_val IS '日期时间';


--
-- Name: COLUMN example_demo.text_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.text_val IS '长文本';


--
-- Name: COLUMN example_demo.json_val; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.json_val IS '元数据(JSON格式)';


--
-- Name: COLUMN example_demo.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.id IS '主键ID';


--
-- Name: COLUMN example_demo.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN example_demo.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.status IS '状态';


--
-- Name: COLUMN example_demo.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.description IS '备注/描述';


--
-- Name: COLUMN example_demo.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.created_time IS '创建时间';


--
-- Name: COLUMN example_demo.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.updated_time IS '更新时间';


--
-- Name: COLUMN example_demo.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN example_demo.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.deleted_time IS '删除时间';


--
-- Name: COLUMN example_demo.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.tenant_id IS '租户ID';


--
-- Name: COLUMN example_demo.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.created_id IS '创建人ID';


--
-- Name: COLUMN example_demo.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.updated_id IS '更新人ID';


--
-- Name: COLUMN example_demo.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.example_demo.deleted_id IS '删除人ID';


--
-- Name: example_demo_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.example_demo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.example_demo_id_seq OWNER TO root;

--
-- Name: example_demo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.example_demo_id_seq OWNED BY public.example_demo.id;


--
-- Name: gen_table; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.gen_table (
    table_name character varying(200) NOT NULL,
    table_comment character varying(500),
    class_name character varying(100) NOT NULL,
    package_name character varying(100),
    module_name character varying(30),
    business_name character varying(30),
    function_name character varying(100),
    sub_table_name character varying(64) DEFAULT NULL::character varying,
    sub_table_fk_name character varying(64) DEFAULT NULL::character varying,
    parent_menu_id integer,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.gen_table OWNER TO root;

--
-- Name: TABLE gen_table; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.gen_table IS '代码生成表';


--
-- Name: COLUMN gen_table.table_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.table_name IS '表名称';


--
-- Name: COLUMN gen_table.table_comment; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.table_comment IS '表描述';


--
-- Name: COLUMN gen_table.class_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.class_name IS '实体类名称';


--
-- Name: COLUMN gen_table.package_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.package_name IS '生成包路径';


--
-- Name: COLUMN gen_table.module_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.module_name IS '生成模块名';


--
-- Name: COLUMN gen_table.business_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.business_name IS '生成业务名';


--
-- Name: COLUMN gen_table.function_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.function_name IS '生成功能名';


--
-- Name: COLUMN gen_table.sub_table_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.sub_table_name IS '关联子表的表名';


--
-- Name: COLUMN gen_table.sub_table_fk_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.sub_table_fk_name IS '子表关联的外键名';


--
-- Name: COLUMN gen_table.parent_menu_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.parent_menu_id IS '父菜单ID';


--
-- Name: COLUMN gen_table.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.id IS '主键ID';


--
-- Name: COLUMN gen_table.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN gen_table.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.status IS '状态';


--
-- Name: COLUMN gen_table.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.description IS '备注/描述';


--
-- Name: COLUMN gen_table.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.created_time IS '创建时间';


--
-- Name: COLUMN gen_table.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.updated_time IS '更新时间';


--
-- Name: COLUMN gen_table.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN gen_table.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.deleted_time IS '删除时间';


--
-- Name: COLUMN gen_table.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.tenant_id IS '租户ID';


--
-- Name: COLUMN gen_table.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.created_id IS '创建人ID';


--
-- Name: COLUMN gen_table.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.updated_id IS '更新人ID';


--
-- Name: COLUMN gen_table.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table.deleted_id IS '删除人ID';


--
-- Name: gen_table_column; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.gen_table_column (
    column_name character varying(200) NOT NULL,
    column_comment character varying(500),
    column_type character varying(100) NOT NULL,
    column_length character varying(50),
    column_default character varying(200),
    is_pk boolean DEFAULT false NOT NULL,
    is_increment boolean DEFAULT false NOT NULL,
    is_nullable boolean DEFAULT true NOT NULL,
    is_unique boolean DEFAULT false NOT NULL,
    python_type character varying(100),
    python_field character varying(200),
    is_insert boolean DEFAULT true NOT NULL,
    is_edit boolean DEFAULT true NOT NULL,
    is_list boolean DEFAULT true NOT NULL,
    is_query boolean DEFAULT false NOT NULL,
    query_type character varying(50),
    html_type character varying(100),
    dict_type character varying(200),
    sort integer NOT NULL,
    table_id integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.gen_table_column OWNER TO root;

--
-- Name: TABLE gen_table_column; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.gen_table_column IS '代码生成表字段';


--
-- Name: COLUMN gen_table_column.column_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.column_name IS '列名称';


--
-- Name: COLUMN gen_table_column.column_comment; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.column_comment IS '列描述';


--
-- Name: COLUMN gen_table_column.column_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.column_type IS '列类型';


--
-- Name: COLUMN gen_table_column.column_length; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.column_length IS '列长度';


--
-- Name: COLUMN gen_table_column.column_default; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.column_default IS '列默认值';


--
-- Name: COLUMN gen_table_column.is_pk; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_pk IS '是否主键';


--
-- Name: COLUMN gen_table_column.is_increment; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_increment IS '是否自增';


--
-- Name: COLUMN gen_table_column.is_nullable; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_nullable IS '是否允许为空';


--
-- Name: COLUMN gen_table_column.is_unique; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_unique IS '是否唯一';


--
-- Name: COLUMN gen_table_column.python_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.python_type IS 'Python类型';


--
-- Name: COLUMN gen_table_column.python_field; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.python_field IS 'Python字段名';


--
-- Name: COLUMN gen_table_column.is_insert; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_insert IS '是否为新增字段';


--
-- Name: COLUMN gen_table_column.is_edit; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_edit IS '是否编辑字段';


--
-- Name: COLUMN gen_table_column.is_list; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_list IS '是否列表字段';


--
-- Name: COLUMN gen_table_column.is_query; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_query IS '是否查询字段';


--
-- Name: COLUMN gen_table_column.query_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.query_type IS '查询方式';


--
-- Name: COLUMN gen_table_column.html_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.html_type IS '显示类型';


--
-- Name: COLUMN gen_table_column.dict_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.dict_type IS '字典类型';


--
-- Name: COLUMN gen_table_column.sort; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.sort IS '排序';


--
-- Name: COLUMN gen_table_column.table_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.table_id IS '归属表编号';


--
-- Name: COLUMN gen_table_column.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.id IS '主键ID';


--
-- Name: COLUMN gen_table_column.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN gen_table_column.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.status IS '状态';


--
-- Name: COLUMN gen_table_column.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.description IS '备注/描述';


--
-- Name: COLUMN gen_table_column.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.created_time IS '创建时间';


--
-- Name: COLUMN gen_table_column.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.updated_time IS '更新时间';


--
-- Name: COLUMN gen_table_column.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN gen_table_column.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.deleted_time IS '删除时间';


--
-- Name: COLUMN gen_table_column.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.tenant_id IS '租户ID';


--
-- Name: COLUMN gen_table_column.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.created_id IS '创建人ID';


--
-- Name: COLUMN gen_table_column.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.updated_id IS '更新人ID';


--
-- Name: COLUMN gen_table_column.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.gen_table_column.deleted_id IS '删除人ID';


--
-- Name: gen_table_column_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.gen_table_column_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gen_table_column_id_seq OWNER TO root;

--
-- Name: gen_table_column_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.gen_table_column_id_seq OWNED BY public.gen_table_column.id;


--
-- Name: gen_table_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.gen_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gen_table_id_seq OWNER TO root;

--
-- Name: gen_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.gen_table_id_seq OWNED BY public.gen_table.id;


--
-- Name: platform_email_config; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_email_config (
    name character varying(100) NOT NULL,
    smtp_host character varying(255) NOT NULL,
    smtp_port integer NOT NULL,
    smtp_user character varying(255) NOT NULL,
    smtp_password character varying(255) NOT NULL,
    from_name character varying(100) NOT NULL,
    use_tls boolean NOT NULL,
    is_default boolean NOT NULL,
    timeout integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_email_config OWNER TO root;

--
-- Name: TABLE platform_email_config; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_email_config IS '邮件 SMTP 配置表';


--
-- Name: COLUMN platform_email_config.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.name IS '配置名称';


--
-- Name: COLUMN platform_email_config.smtp_host; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.smtp_host IS 'SMTP 服务器地址';


--
-- Name: COLUMN platform_email_config.smtp_port; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.smtp_port IS 'SMTP 端口（465=SSL, 587=TLS）';


--
-- Name: COLUMN platform_email_config.smtp_user; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.smtp_user IS 'SMTP 登录用户名（发件邮箱）';


--
-- Name: COLUMN platform_email_config.smtp_password; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.smtp_password IS 'SMTP 授权密码（AES 加密存储）';


--
-- Name: COLUMN platform_email_config.from_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.from_name IS '发件人显示名';


--
-- Name: COLUMN platform_email_config.use_tls; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.use_tls IS '是否启用 SSL/TLS';


--
-- Name: COLUMN platform_email_config.is_default; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.is_default IS '是否为默认配置';


--
-- Name: COLUMN platform_email_config.timeout; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.timeout IS '连接超时（秒）';


--
-- Name: COLUMN platform_email_config.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.id IS '主键ID';


--
-- Name: COLUMN platform_email_config.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_email_config.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.status IS '状态';


--
-- Name: COLUMN platform_email_config.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.description IS '备注/描述';


--
-- Name: COLUMN platform_email_config.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.created_time IS '创建时间';


--
-- Name: COLUMN platform_email_config.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.updated_time IS '更新时间';


--
-- Name: COLUMN platform_email_config.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_email_config.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_config.deleted_time IS '删除时间';


--
-- Name: platform_email_config_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_email_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_email_config_id_seq OWNER TO root;

--
-- Name: platform_email_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_email_config_id_seq OWNED BY public.platform_email_config.id;


--
-- Name: platform_email_log; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_email_log (
    config_id integer,
    template_code character varying(100),
    to_email character varying(255) NOT NULL,
    to_name character varying(100),
    subject character varying(255) NOT NULL,
    biz_type character varying(50) NOT NULL,
    error_msg text,
    retry_count integer NOT NULL,
    tenant_id integer,
    sent_time timestamp without time zone,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_email_log OWNER TO root;

--
-- Name: TABLE platform_email_log; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_email_log IS '邮件发送日志表';


--
-- Name: COLUMN platform_email_log.config_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.config_id IS '使用的 SMTP 配置 ID';


--
-- Name: COLUMN platform_email_log.template_code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.template_code IS '模板编码（冗余存储，模板删除后仍可追溯）';


--
-- Name: COLUMN platform_email_log.to_email; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.to_email IS '收件人邮箱';


--
-- Name: COLUMN platform_email_log.to_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.to_name IS '收件人姓名';


--
-- Name: COLUMN platform_email_log.subject; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.subject IS '邮件主题（渲染后）';


--
-- Name: COLUMN platform_email_log.biz_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.biz_type IS '业务类型（register/reset_password/invite/expiry_warning/ticket_reply/other）';


--
-- Name: COLUMN platform_email_log.error_msg; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.error_msg IS '失败原因';


--
-- Name: COLUMN platform_email_log.retry_count; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.retry_count IS '重试次数';


--
-- Name: COLUMN platform_email_log.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.tenant_id IS '关联租户 ID（可为空，如平台注册邮件）';


--
-- Name: COLUMN platform_email_log.sent_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.sent_time IS '实际发送时间';


--
-- Name: COLUMN platform_email_log.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.id IS '主键ID';


--
-- Name: COLUMN platform_email_log.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_email_log.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.status IS '状态';


--
-- Name: COLUMN platform_email_log.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.description IS '备注/描述';


--
-- Name: COLUMN platform_email_log.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.created_time IS '创建时间';


--
-- Name: COLUMN platform_email_log.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.updated_time IS '更新时间';


--
-- Name: COLUMN platform_email_log.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_email_log.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_log.deleted_time IS '删除时间';


--
-- Name: platform_email_log_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_email_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_email_log_id_seq OWNER TO root;

--
-- Name: platform_email_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_email_log_id_seq OWNED BY public.platform_email_log.id;


--
-- Name: platform_email_template; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_email_template (
    name character varying(100) NOT NULL,
    template_code character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    body_html text NOT NULL,
    body_text text,
    variables text,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_email_template OWNER TO root;

--
-- Name: TABLE platform_email_template; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_email_template IS '邮件模板表';


--
-- Name: COLUMN platform_email_template.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.name IS '模板名称';


--
-- Name: COLUMN platform_email_template.template_code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.template_code IS '模板编码（业务键）';


--
-- Name: COLUMN platform_email_template.subject; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.subject IS '邮件主题（可含变量）';


--
-- Name: COLUMN platform_email_template.body_html; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.body_html IS '邮件正文 HTML（Jinja2 模板）';


--
-- Name: COLUMN platform_email_template.body_text; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.body_text IS '邮件纯文本版本（降级用）';


--
-- Name: COLUMN platform_email_template.variables; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.variables IS '模板变量说明（JSON 格式，如 {"username": "用户名", "link": "链接"}）';


--
-- Name: COLUMN platform_email_template.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.id IS '主键ID';


--
-- Name: COLUMN platform_email_template.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_email_template.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.status IS '状态';


--
-- Name: COLUMN platform_email_template.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.description IS '备注/描述';


--
-- Name: COLUMN platform_email_template.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.created_time IS '创建时间';


--
-- Name: COLUMN platform_email_template.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.updated_time IS '更新时间';


--
-- Name: COLUMN platform_email_template.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_email_template.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_email_template.deleted_time IS '删除时间';


--
-- Name: platform_email_template_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_email_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_email_template_id_seq OWNER TO root;

--
-- Name: platform_email_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_email_template_id_seq OWNED BY public.platform_email_template.id;


--
-- Name: platform_invoice; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_invoice (
    invoice_no character varying(32) NOT NULL,
    order_id integer NOT NULL,
    invoice_type character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    tax_no character varying(50),
    bank_info text,
    address_info text,
    amount integer NOT NULL,
    tax_amount integer NOT NULL,
    pdf_url character varying(500),
    api_response text,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.platform_invoice OWNER TO root;

--
-- Name: TABLE platform_invoice; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_invoice IS '发票表';


--
-- Name: COLUMN platform_invoice.invoice_no; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.invoice_no IS '发票号码';


--
-- Name: COLUMN platform_invoice.order_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.order_id IS '关联订单';


--
-- Name: COLUMN platform_invoice.invoice_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.invoice_type IS 'vat_normal/vat_special';


--
-- Name: COLUMN platform_invoice.title; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.title IS '发票抬头';


--
-- Name: COLUMN platform_invoice.tax_no; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.tax_no IS '纳税人识别号';


--
-- Name: COLUMN platform_invoice.bank_info; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.bank_info IS '开户行及账号';


--
-- Name: COLUMN platform_invoice.address_info; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.address_info IS '注册地址及电话';


--
-- Name: COLUMN platform_invoice.amount; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.amount IS '发票金额(分)';


--
-- Name: COLUMN platform_invoice.tax_amount; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.tax_amount IS '税额(分)';


--
-- Name: COLUMN platform_invoice.pdf_url; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.pdf_url IS 'PDF下载地址';


--
-- Name: COLUMN platform_invoice.api_response; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.api_response IS '第三方API响应';


--
-- Name: COLUMN platform_invoice.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.id IS '主键ID';


--
-- Name: COLUMN platform_invoice.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_invoice.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.status IS '状态';


--
-- Name: COLUMN platform_invoice.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.description IS '备注/描述';


--
-- Name: COLUMN platform_invoice.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.created_time IS '创建时间';


--
-- Name: COLUMN platform_invoice.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.updated_time IS '更新时间';


--
-- Name: COLUMN platform_invoice.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_invoice.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.deleted_time IS '删除时间';


--
-- Name: COLUMN platform_invoice.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_invoice.tenant_id IS '租户ID';


--
-- Name: platform_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_invoice_id_seq OWNER TO root;

--
-- Name: platform_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_invoice_id_seq OWNED BY public.platform_invoice.id;


--
-- Name: platform_menu; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_menu (
    name character varying(50) NOT NULL,
    type integer NOT NULL,
    "order" integer NOT NULL,
    permission character varying(100),
    icon character varying(50),
    route_name character varying(100),
    route_path character varying(200),
    component_path character varying(200),
    redirect character varying(200),
    hidden boolean NOT NULL,
    keep_alive boolean NOT NULL,
    always_show boolean NOT NULL,
    title character varying(50),
    params json,
    affix boolean NOT NULL,
    client character varying(20) DEFAULT 'pc'::character varying NOT NULL,
    link character varying(500),
    is_iframe boolean NOT NULL,
    is_hide_tab boolean NOT NULL,
    active_path character varying(200),
    show_badge boolean NOT NULL,
    show_text_badge character varying(20),
    scope character varying(20) DEFAULT 'tenant'::character varying NOT NULL,
    parent_id integer,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_menu OWNER TO root;

--
-- Name: TABLE platform_menu; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_menu IS '平台菜单表';


--
-- Name: COLUMN platform_menu.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.name IS '菜单名称';


--
-- Name: COLUMN platform_menu.type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.type IS '菜单类型(1:目录 2:菜单 3:按钮/权限 4:链接)';


--
-- Name: COLUMN platform_menu."order"; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu."order" IS '显示排序';


--
-- Name: COLUMN platform_menu.permission; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.permission IS '权限标识(如:module_system:user:query)';


--
-- Name: COLUMN platform_menu.icon; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.icon IS '菜单图标';


--
-- Name: COLUMN platform_menu.route_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.route_name IS '路由名称';


--
-- Name: COLUMN platform_menu.route_path; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.route_path IS '路由路径';


--
-- Name: COLUMN platform_menu.component_path; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.component_path IS '组件路径';


--
-- Name: COLUMN platform_menu.redirect; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.redirect IS '重定向地址';


--
-- Name: COLUMN platform_menu.hidden; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.hidden IS '是否隐藏(True:隐藏 False:显示)';


--
-- Name: COLUMN platform_menu.keep_alive; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.keep_alive IS '是否缓存(True:是 False:否)';


--
-- Name: COLUMN platform_menu.always_show; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.always_show IS '是否始终显示(True:是 False:否)';


--
-- Name: COLUMN platform_menu.title; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.title IS '菜单标题';


--
-- Name: COLUMN platform_menu.params; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.params IS '路由参数(JSON对象)';


--
-- Name: COLUMN platform_menu.affix; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.affix IS '是否固定标签页(True:是 False:否)';


--
-- Name: COLUMN platform_menu.client; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.client IS '终端(pc:管理端桌面 app:移动端)';


--
-- Name: COLUMN platform_menu.link; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.link IS '外链地址(仅type=4)';


--
-- Name: COLUMN platform_menu.is_iframe; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.is_iframe IS '是否嵌入iframe(True:是 False:否)';


--
-- Name: COLUMN platform_menu.is_hide_tab; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.is_hide_tab IS '是否隐藏标签页(True:是 False:否)';


--
-- Name: COLUMN platform_menu.active_path; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.active_path IS '激活菜单路径(用于高亮父级)';


--
-- Name: COLUMN platform_menu.show_badge; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.show_badge IS '是否显示红点角标(True:是 False:否)';


--
-- Name: COLUMN platform_menu.show_text_badge; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.show_text_badge IS '文字角标内容';


--
-- Name: COLUMN platform_menu.scope; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.scope IS '菜单可见范围(platform:仅平台 tenant:租户可用)';


--
-- Name: COLUMN platform_menu.parent_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.parent_id IS '父菜单ID';


--
-- Name: COLUMN platform_menu.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.id IS '主键ID';


--
-- Name: COLUMN platform_menu.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_menu.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.status IS '状态';


--
-- Name: COLUMN platform_menu.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.description IS '备注/描述';


--
-- Name: COLUMN platform_menu.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.created_time IS '创建时间';


--
-- Name: COLUMN platform_menu.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.updated_time IS '更新时间';


--
-- Name: COLUMN platform_menu.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_menu.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_menu.deleted_time IS '删除时间';


--
-- Name: platform_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_menu_id_seq OWNER TO root;

--
-- Name: platform_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_menu_id_seq OWNED BY public.platform_menu.id;


--
-- Name: platform_order; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_order (
    order_no character varying(32) NOT NULL,
    package_id integer,
    plugin_id integer,
    order_type character varying(20) NOT NULL,
    amount integer NOT NULL,
    period_count integer NOT NULL,
    pay_method character varying(20),
    pay_time timestamp without time zone,
    expire_time timestamp without time zone NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.platform_order OWNER TO root;

--
-- Name: TABLE platform_order; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_order IS '订单表';


--
-- Name: COLUMN platform_order.order_no; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.order_no IS '订单号';


--
-- Name: COLUMN platform_order.package_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.package_id IS '购买套餐(插件订单为空)';


--
-- Name: COLUMN platform_order.plugin_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.plugin_id IS '购买插件(套餐订单为空)';


--
-- Name: COLUMN platform_order.order_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.order_type IS 'new/renew/upgrade/downgrade/plugin';


--
-- Name: COLUMN platform_order.amount; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.amount IS '金额(分)';


--
-- Name: COLUMN platform_order.period_count; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.period_count IS '购买周期数';


--
-- Name: COLUMN platform_order.pay_method; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.pay_method IS 'alipay/wxpay';


--
-- Name: COLUMN platform_order.pay_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.pay_time IS '支付时间';


--
-- Name: COLUMN platform_order.expire_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.expire_time IS '订单过期时间(15分钟)';


--
-- Name: COLUMN platform_order.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.id IS '主键ID';


--
-- Name: COLUMN platform_order.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_order.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.status IS '状态';


--
-- Name: COLUMN platform_order.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.description IS '备注/描述';


--
-- Name: COLUMN platform_order.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.created_time IS '创建时间';


--
-- Name: COLUMN platform_order.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.updated_time IS '更新时间';


--
-- Name: COLUMN platform_order.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_order.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.deleted_time IS '删除时间';


--
-- Name: COLUMN platform_order.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_order.tenant_id IS '租户ID';


--
-- Name: platform_order_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_order_id_seq OWNER TO root;

--
-- Name: platform_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_order_id_seq OWNED BY public.platform_order.id;


--
-- Name: platform_package; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_package (
    name character varying(100) NOT NULL,
    code character varying(100) NOT NULL,
    sort integer NOT NULL,
    price integer NOT NULL,
    period character varying(10) NOT NULL,
    trial_days integer NOT NULL,
    max_users integer NOT NULL,
    max_roles integer NOT NULL,
    max_depts integer NOT NULL,
    max_storage_mb integer NOT NULL,
    rate_limit integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_package OWNER TO root;

--
-- Name: TABLE platform_package; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_package IS '租户套餐表';


--
-- Name: COLUMN platform_package.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.name IS '套餐名称';


--
-- Name: COLUMN platform_package.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.code IS '套餐编码';


--
-- Name: COLUMN platform_package.sort; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.sort IS '排序';


--
-- Name: COLUMN platform_package.price; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.price IS '价格(分)';


--
-- Name: COLUMN platform_package.period; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.period IS '计费周期(month/year)';


--
-- Name: COLUMN platform_package.trial_days; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.trial_days IS '免费试用天数';


--
-- Name: COLUMN platform_package.max_users; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.max_users IS '最大用户数';


--
-- Name: COLUMN platform_package.max_roles; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.max_roles IS '最大角色数';


--
-- Name: COLUMN platform_package.max_depts; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.max_depts IS '最大部门数';


--
-- Name: COLUMN platform_package.max_storage_mb; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.max_storage_mb IS '最大存储(MB)';


--
-- Name: COLUMN platform_package.rate_limit; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.rate_limit IS 'API速率限制(请求/10秒)';


--
-- Name: COLUMN platform_package.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.id IS '主键ID';


--
-- Name: COLUMN platform_package.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_package.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.status IS '状态';


--
-- Name: COLUMN platform_package.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.description IS '备注/描述';


--
-- Name: COLUMN platform_package.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.created_time IS '创建时间';


--
-- Name: COLUMN platform_package.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.updated_time IS '更新时间';


--
-- Name: COLUMN platform_package.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_package.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package.deleted_time IS '删除时间';


--
-- Name: platform_package_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_package_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_package_id_seq OWNER TO root;

--
-- Name: platform_package_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_package_id_seq OWNED BY public.platform_package.id;


--
-- Name: platform_package_menu; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_package_menu (
    id integer NOT NULL,
    package_id integer NOT NULL,
    menu_id integer NOT NULL
);


ALTER TABLE public.platform_package_menu OWNER TO root;

--
-- Name: TABLE platform_package_menu; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_package_menu IS '套餐菜单关联表';


--
-- Name: COLUMN platform_package_menu.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_menu.id IS '主键ID';


--
-- Name: COLUMN platform_package_menu.package_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_menu.package_id IS '套餐ID';


--
-- Name: COLUMN platform_package_menu.menu_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_menu.menu_id IS '菜单ID';


--
-- Name: platform_package_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_package_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_package_menu_id_seq OWNER TO root;

--
-- Name: platform_package_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_package_menu_id_seq OWNED BY public.platform_package_menu.id;


--
-- Name: platform_package_plugin; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_package_plugin (
    id integer NOT NULL,
    package_id integer NOT NULL,
    plugin_id integer NOT NULL
);


ALTER TABLE public.platform_package_plugin OWNER TO root;

--
-- Name: TABLE platform_package_plugin; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_package_plugin IS '套餐插件关联表';


--
-- Name: COLUMN platform_package_plugin.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_plugin.id IS '主键ID';


--
-- Name: COLUMN platform_package_plugin.package_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_plugin.package_id IS '套餐ID';


--
-- Name: COLUMN platform_package_plugin.plugin_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_package_plugin.plugin_id IS '插件ID';


--
-- Name: platform_package_plugin_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_package_plugin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_package_plugin_id_seq OWNER TO root;

--
-- Name: platform_package_plugin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_package_plugin_id_seq OWNED BY public.platform_package_plugin.id;


--
-- Name: platform_payment_record; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_payment_record (
    order_id integer NOT NULL,
    transaction_id character varying(64),
    pay_method character varying(20) NOT NULL,
    amount integer NOT NULL,
    raw_response text,
    pay_time timestamp without time zone,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.platform_payment_record OWNER TO root;

--
-- Name: TABLE platform_payment_record; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_payment_record IS '支付记录表';


--
-- Name: COLUMN platform_payment_record.order_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.order_id IS '关联订单';


--
-- Name: COLUMN platform_payment_record.transaction_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.transaction_id IS '第三方交易号';


--
-- Name: COLUMN platform_payment_record.pay_method; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.pay_method IS '支付方式';


--
-- Name: COLUMN platform_payment_record.amount; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.amount IS '支付金额(分)';


--
-- Name: COLUMN platform_payment_record.raw_response; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.raw_response IS '原始回调JSON';


--
-- Name: COLUMN platform_payment_record.pay_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.pay_time IS '支付完成时间';


--
-- Name: COLUMN platform_payment_record.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.id IS '主键ID';


--
-- Name: COLUMN platform_payment_record.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_payment_record.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.status IS '状态';


--
-- Name: COLUMN platform_payment_record.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.description IS '备注/描述';


--
-- Name: COLUMN platform_payment_record.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.created_time IS '创建时间';


--
-- Name: COLUMN platform_payment_record.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.updated_time IS '更新时间';


--
-- Name: COLUMN platform_payment_record.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_payment_record.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.deleted_time IS '删除时间';


--
-- Name: COLUMN platform_payment_record.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_payment_record.tenant_id IS '租户ID';


--
-- Name: platform_payment_record_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_payment_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_payment_record_id_seq OWNER TO root;

--
-- Name: platform_payment_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_payment_record_id_seq OWNED BY public.platform_payment_record.id;


--
-- Name: platform_plugin; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_plugin (
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    version character varying(20) NOT NULL,
    author character varying(100),
    icon character varying(500),
    category character varying(20) NOT NULL,
    price integer NOT NULL,
    menu_path character varying(200),
    permission_prefix character varying(100),
    dependencies text,
    sort integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_plugin OWNER TO root;

--
-- Name: TABLE platform_plugin; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_plugin IS '插件注册表';


--
-- Name: COLUMN platform_plugin.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.name IS '插件名称';


--
-- Name: COLUMN platform_plugin.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.code IS '插件编码(module_xxx)';


--
-- Name: COLUMN platform_plugin.version; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.version IS '版本号';


--
-- Name: COLUMN platform_plugin.author; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.author IS '作者';


--
-- Name: COLUMN platform_plugin.icon; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.icon IS '图标URL';


--
-- Name: COLUMN platform_plugin.category; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.category IS '分类(tool/ai/monitor/business)';


--
-- Name: COLUMN platform_plugin.price; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.price IS '价格(分,0=免费)';


--
-- Name: COLUMN platform_plugin.menu_path; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.menu_path IS '菜单路径(安装后显示)';


--
-- Name: COLUMN platform_plugin.permission_prefix; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.permission_prefix IS '权限前缀';


--
-- Name: COLUMN platform_plugin.dependencies; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.dependencies IS '依赖插件编码(JSON数组)';


--
-- Name: COLUMN platform_plugin.sort; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.sort IS '排序';


--
-- Name: COLUMN platform_plugin.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.id IS '主键ID';


--
-- Name: COLUMN platform_plugin.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_plugin.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.status IS '状态';


--
-- Name: COLUMN platform_plugin.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.description IS '备注/描述';


--
-- Name: COLUMN platform_plugin.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.created_time IS '创建时间';


--
-- Name: COLUMN platform_plugin.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.updated_time IS '更新时间';


--
-- Name: COLUMN platform_plugin.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_plugin.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_plugin.deleted_time IS '删除时间';


--
-- Name: platform_plugin_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_plugin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_plugin_id_seq OWNER TO root;

--
-- Name: platform_plugin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_plugin_id_seq OWNED BY public.platform_plugin.id;


--
-- Name: platform_refund; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_refund (
    order_id integer NOT NULL,
    refund_no character varying(32) NOT NULL,
    amount integer NOT NULL,
    reason text NOT NULL,
    refund_transaction_id character varying(64),
    reviewer_id integer,
    review_time timestamp without time zone,
    reject_reason text,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.platform_refund OWNER TO root;

--
-- Name: TABLE platform_refund; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_refund IS '退款表';


--
-- Name: COLUMN platform_refund.order_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.order_id IS '关联订单';


--
-- Name: COLUMN platform_refund.refund_no; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.refund_no IS '退款单号';


--
-- Name: COLUMN platform_refund.amount; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.amount IS '退款金额(分)';


--
-- Name: COLUMN platform_refund.reason; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.reason IS '退款原因';


--
-- Name: COLUMN platform_refund.refund_transaction_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.refund_transaction_id IS '退款交易号';


--
-- Name: COLUMN platform_refund.reviewer_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.reviewer_id IS '审核人';


--
-- Name: COLUMN platform_refund.review_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.review_time IS '审核时间';


--
-- Name: COLUMN platform_refund.reject_reason; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.reject_reason IS '驳回原因';


--
-- Name: COLUMN platform_refund.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.id IS '主键ID';


--
-- Name: COLUMN platform_refund.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_refund.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.status IS '状态';


--
-- Name: COLUMN platform_refund.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.description IS '备注/描述';


--
-- Name: COLUMN platform_refund.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.created_time IS '创建时间';


--
-- Name: COLUMN platform_refund.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.updated_time IS '更新时间';


--
-- Name: COLUMN platform_refund.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_refund.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.deleted_time IS '删除时间';


--
-- Name: COLUMN platform_refund.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_refund.tenant_id IS '租户ID';


--
-- Name: platform_refund_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_refund_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_refund_id_seq OWNER TO root;

--
-- Name: platform_refund_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_refund_id_seq OWNED BY public.platform_refund.id;


--
-- Name: platform_tenant; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_tenant (
    name character varying(100) NOT NULL,
    code character varying(100) NOT NULL,
    contact_name character varying(64),
    contact_phone character varying(20),
    contact_email character varying(128),
    address character varying(255),
    domain character varying(255),
    logo_url character varying(500),
    sort integer NOT NULL,
    package_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    version character varying(20),
    favicon character varying(500),
    login_bg character varying(500),
    copyright character varying(255),
    keep_record character varying(100),
    help_doc character varying(500),
    privacy character varying(500),
    clause character varying(500),
    git_code character varying(500),
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone
);


ALTER TABLE public.platform_tenant OWNER TO root;

--
-- Name: TABLE platform_tenant; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_tenant IS '租户表';


--
-- Name: COLUMN platform_tenant.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.name IS '租户名称';


--
-- Name: COLUMN platform_tenant.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.code IS '租户编码';


--
-- Name: COLUMN platform_tenant.contact_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.contact_name IS '联系人姓名';


--
-- Name: COLUMN platform_tenant.contact_phone; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.contact_phone IS '联系人电话';


--
-- Name: COLUMN platform_tenant.contact_email; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.contact_email IS '联系人邮箱';


--
-- Name: COLUMN platform_tenant.address; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.address IS '地址';


--
-- Name: COLUMN platform_tenant.domain; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.domain IS '域名';


--
-- Name: COLUMN platform_tenant.logo_url; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.logo_url IS 'Logo URL';


--
-- Name: COLUMN platform_tenant.sort; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.sort IS '排序';


--
-- Name: COLUMN platform_tenant.package_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.package_id IS '关联套餐ID';


--
-- Name: COLUMN platform_tenant.start_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.start_time IS '开始时间';


--
-- Name: COLUMN platform_tenant.end_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.end_time IS '结束时间';


--
-- Name: COLUMN platform_tenant.version; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.version IS '版本号';


--
-- Name: COLUMN platform_tenant.favicon; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.favicon IS 'favicon地址';


--
-- Name: COLUMN platform_tenant.login_bg; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.login_bg IS '登录背景地址';


--
-- Name: COLUMN platform_tenant.copyright; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.copyright IS '版权信息';


--
-- Name: COLUMN platform_tenant.keep_record; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.keep_record IS '备案号';


--
-- Name: COLUMN platform_tenant.help_doc; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.help_doc IS '帮助文档地址';


--
-- Name: COLUMN platform_tenant.privacy; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.privacy IS '隐私政策地址';


--
-- Name: COLUMN platform_tenant.clause; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.clause IS '服务条款地址';


--
-- Name: COLUMN platform_tenant.git_code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.git_code IS '源码地址';


--
-- Name: COLUMN platform_tenant.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.id IS '主键ID';


--
-- Name: COLUMN platform_tenant.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN platform_tenant.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.status IS '状态';


--
-- Name: COLUMN platform_tenant.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.description IS '备注/描述';


--
-- Name: COLUMN platform_tenant.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.created_time IS '创建时间';


--
-- Name: COLUMN platform_tenant.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.updated_time IS '更新时间';


--
-- Name: COLUMN platform_tenant.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN platform_tenant.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant.deleted_time IS '删除时间';


--
-- Name: platform_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_tenant_id_seq OWNER TO root;

--
-- Name: platform_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_tenant_id_seq OWNED BY public.platform_tenant.id;


--
-- Name: platform_tenant_plugin; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_tenant_plugin (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    plugin_id integer NOT NULL,
    enabled character varying(1) NOT NULL,
    purchased character varying(1) NOT NULL,
    installed_time timestamp without time zone NOT NULL
);


ALTER TABLE public.platform_tenant_plugin OWNER TO root;

--
-- Name: TABLE platform_tenant_plugin; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_tenant_plugin IS '租户插件关联表';


--
-- Name: COLUMN platform_tenant_plugin.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.id IS '主键ID';


--
-- Name: COLUMN platform_tenant_plugin.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.tenant_id IS '租户ID';


--
-- Name: COLUMN platform_tenant_plugin.plugin_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.plugin_id IS '插件ID';


--
-- Name: COLUMN platform_tenant_plugin.enabled; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.enabled IS '启用(1:启用 0:禁用)';


--
-- Name: COLUMN platform_tenant_plugin.purchased; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.purchased IS '是否已购买(1:已购买 0:未购买)';


--
-- Name: COLUMN platform_tenant_plugin.installed_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_tenant_plugin.installed_time IS '安装时间';


--
-- Name: platform_tenant_plugin_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_tenant_plugin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_tenant_plugin_id_seq OWNER TO root;

--
-- Name: platform_tenant_plugin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_tenant_plugin_id_seq OWNED BY public.platform_tenant_plugin.id;


--
-- Name: platform_user_tenant; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.platform_user_tenant (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tenant_id integer NOT NULL,
    role character varying(20) NOT NULL,
    is_default smallint NOT NULL,
    create_time timestamp without time zone NOT NULL
);


ALTER TABLE public.platform_user_tenant OWNER TO root;

--
-- Name: TABLE platform_user_tenant; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.platform_user_tenant IS '用户租户关联表';


--
-- Name: COLUMN platform_user_tenant.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.id IS '主键ID';


--
-- Name: COLUMN platform_user_tenant.user_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.user_id IS '用户ID';


--
-- Name: COLUMN platform_user_tenant.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.tenant_id IS '租户ID';


--
-- Name: COLUMN platform_user_tenant.role; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.role IS '租户内角色(owner:拥有者 admin:管理员 member:成员)';


--
-- Name: COLUMN platform_user_tenant.is_default; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.is_default IS '是否默认租户(0:否 1:是)';


--
-- Name: COLUMN platform_user_tenant.create_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.platform_user_tenant.create_time IS '创建时间';


--
-- Name: platform_user_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.platform_user_tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_user_tenant_id_seq OWNER TO root;

--
-- Name: platform_user_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.platform_user_tenant_id_seq OWNED BY public.platform_user_tenant.id;


--
-- Name: sys_dept; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_dept (
    name character varying(64) NOT NULL,
    "order" integer NOT NULL,
    code character varying(64) NOT NULL,
    leader character varying(32),
    phone character varying(20),
    email character varying(128),
    parent_id integer,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.sys_dept OWNER TO root;

--
-- Name: TABLE sys_dept; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_dept IS '部门表';


--
-- Name: COLUMN sys_dept.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.name IS '部门名称';


--
-- Name: COLUMN sys_dept."order"; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept."order" IS '显示排序';


--
-- Name: COLUMN sys_dept.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.code IS '部门编码';


--
-- Name: COLUMN sys_dept.leader; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.leader IS '部门负责人';


--
-- Name: COLUMN sys_dept.phone; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.phone IS '手机';


--
-- Name: COLUMN sys_dept.email; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.email IS '邮箱';


--
-- Name: COLUMN sys_dept.parent_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.parent_id IS '父级部门ID';


--
-- Name: COLUMN sys_dept.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.id IS '主键ID';


--
-- Name: COLUMN sys_dept.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_dept.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.status IS '状态';


--
-- Name: COLUMN sys_dept.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.description IS '备注/描述';


--
-- Name: COLUMN sys_dept.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.created_time IS '创建时间';


--
-- Name: COLUMN sys_dept.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.updated_time IS '更新时间';


--
-- Name: COLUMN sys_dept.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_dept.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_dept.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dept.tenant_id IS '租户ID';


--
-- Name: sys_dept_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_dept_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_dept_id_seq OWNER TO root;

--
-- Name: sys_dept_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_dept_id_seq OWNED BY public.sys_dept.id;


--
-- Name: sys_dict_data; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_dict_data (
    dict_sort integer NOT NULL,
    dict_label character varying(255) NOT NULL,
    dict_value character varying(255) NOT NULL,
    css_class character varying(255),
    list_class character varying(255),
    is_default boolean NOT NULL,
    dict_type character varying(255) NOT NULL,
    dict_type_id integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.sys_dict_data OWNER TO root;

--
-- Name: TABLE sys_dict_data; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_dict_data IS '字典数据表';


--
-- Name: COLUMN sys_dict_data.dict_sort; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.dict_sort IS '字典排序';


--
-- Name: COLUMN sys_dict_data.dict_label; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.dict_label IS '字典标签';


--
-- Name: COLUMN sys_dict_data.dict_value; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.dict_value IS '字典键值';


--
-- Name: COLUMN sys_dict_data.css_class; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.css_class IS '样式属性（其他样式扩展）';


--
-- Name: COLUMN sys_dict_data.list_class; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.list_class IS '表格回显样式';


--
-- Name: COLUMN sys_dict_data.is_default; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.is_default IS '是否默认（True是 False否）';


--
-- Name: COLUMN sys_dict_data.dict_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.dict_type IS '字典类型';


--
-- Name: COLUMN sys_dict_data.dict_type_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.dict_type_id IS '字典类型ID';


--
-- Name: COLUMN sys_dict_data.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.id IS '主键ID';


--
-- Name: COLUMN sys_dict_data.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_dict_data.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.status IS '状态';


--
-- Name: COLUMN sys_dict_data.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.description IS '备注/描述';


--
-- Name: COLUMN sys_dict_data.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.created_time IS '创建时间';


--
-- Name: COLUMN sys_dict_data.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.updated_time IS '更新时间';


--
-- Name: COLUMN sys_dict_data.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_dict_data.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_dict_data.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_data.tenant_id IS '租户ID';


--
-- Name: sys_dict_data_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_dict_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_dict_data_id_seq OWNER TO root;

--
-- Name: sys_dict_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_dict_data_id_seq OWNED BY public.sys_dict_data.id;


--
-- Name: sys_dict_type; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_dict_type (
    dict_name character varying(64) NOT NULL,
    dict_type character varying(255) NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.sys_dict_type OWNER TO root;

--
-- Name: TABLE sys_dict_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_dict_type IS '字典类型表';


--
-- Name: COLUMN sys_dict_type.dict_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.dict_name IS '字典名称';


--
-- Name: COLUMN sys_dict_type.dict_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.dict_type IS '字典类型';


--
-- Name: COLUMN sys_dict_type.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.id IS '主键ID';


--
-- Name: COLUMN sys_dict_type.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_dict_type.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.status IS '状态';


--
-- Name: COLUMN sys_dict_type.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.description IS '备注/描述';


--
-- Name: COLUMN sys_dict_type.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.created_time IS '创建时间';


--
-- Name: COLUMN sys_dict_type.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.updated_time IS '更新时间';


--
-- Name: COLUMN sys_dict_type.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_dict_type.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_dict_type.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_dict_type.tenant_id IS '租户ID';


--
-- Name: sys_dict_type_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_dict_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_dict_type_id_seq OWNER TO root;

--
-- Name: sys_dict_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_dict_type_id_seq OWNED BY public.sys_dict_type.id;


--
-- Name: sys_login_log; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_login_log (
    status integer NOT NULL,
    username character varying(64) NOT NULL,
    login_location character varying(255),
    login_ip character varying(50),
    request_os character varying(64),
    request_browser character varying(64),
    msg character varying(255),
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_login_log OWNER TO root;

--
-- Name: TABLE sys_login_log; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_login_log IS '登录日志表';


--
-- Name: COLUMN sys_login_log.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.status IS '登录状态(1成功 2失败)';


--
-- Name: COLUMN sys_login_log.username; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.username IS '用户名';


--
-- Name: COLUMN sys_login_log.login_location; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.login_location IS '登录位置';


--
-- Name: COLUMN sys_login_log.login_ip; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.login_ip IS '登录IP地址';


--
-- Name: COLUMN sys_login_log.request_os; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.request_os IS '操作系统';


--
-- Name: COLUMN sys_login_log.request_browser; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.request_browser IS '浏览器';


--
-- Name: COLUMN sys_login_log.msg; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.msg IS '提示消息';


--
-- Name: COLUMN sys_login_log.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.id IS '主键ID';


--
-- Name: COLUMN sys_login_log.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_login_log.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.description IS '备注/描述';


--
-- Name: COLUMN sys_login_log.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.created_time IS '创建时间';


--
-- Name: COLUMN sys_login_log.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.updated_time IS '更新时间';


--
-- Name: COLUMN sys_login_log.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_login_log.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_login_log.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_login_log.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.created_id IS '创建人ID';


--
-- Name: COLUMN sys_login_log.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_login_log.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_login_log.deleted_id IS '删除人ID';


--
-- Name: sys_login_log_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_login_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_login_log_id_seq OWNER TO root;

--
-- Name: sys_login_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_login_log_id_seq OWNED BY public.sys_login_log.id;


--
-- Name: sys_notice; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_notice (
    notice_title character varying(64) NOT NULL,
    notice_type character varying(1) NOT NULL,
    notice_content text,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_notice OWNER TO root;

--
-- Name: TABLE sys_notice; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_notice IS '通知公告表';


--
-- Name: COLUMN sys_notice.notice_title; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.notice_title IS '公告标题';


--
-- Name: COLUMN sys_notice.notice_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.notice_type IS '公告类型(1通知 2公告)';


--
-- Name: COLUMN sys_notice.notice_content; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.notice_content IS '公告内容';


--
-- Name: COLUMN sys_notice.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.id IS '主键ID';


--
-- Name: COLUMN sys_notice.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_notice.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.status IS '状态';


--
-- Name: COLUMN sys_notice.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.description IS '备注/描述';


--
-- Name: COLUMN sys_notice.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.created_time IS '创建时间';


--
-- Name: COLUMN sys_notice.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.updated_time IS '更新时间';


--
-- Name: COLUMN sys_notice.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_notice.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_notice.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_notice.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.created_id IS '创建人ID';


--
-- Name: COLUMN sys_notice.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_notice.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice.deleted_id IS '删除人ID';


--
-- Name: sys_notice_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_notice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_notice_id_seq OWNER TO root;

--
-- Name: sys_notice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_notice_id_seq OWNED BY public.sys_notice.id;


--
-- Name: sys_notice_read; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_notice_read (
    user_id integer NOT NULL,
    notice_id integer NOT NULL,
    read_time timestamp without time zone NOT NULL
);


ALTER TABLE public.sys_notice_read OWNER TO root;

--
-- Name: TABLE sys_notice_read; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_notice_read IS '通知已读记录表';


--
-- Name: COLUMN sys_notice_read.user_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice_read.user_id IS '用户ID';


--
-- Name: COLUMN sys_notice_read.notice_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice_read.notice_id IS '通知ID';


--
-- Name: COLUMN sys_notice_read.read_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_notice_read.read_time IS '已读时间';


--
-- Name: sys_operation_log; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_operation_log (
    request_path character varying(255) NOT NULL,
    request_method character varying(10) NOT NULL,
    request_payload text,
    response_code integer NOT NULL,
    response_json text,
    process_time character varying(20),
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_operation_log OWNER TO root;

--
-- Name: TABLE sys_operation_log; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_operation_log IS '操作日志表';


--
-- Name: COLUMN sys_operation_log.request_path; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.request_path IS '请求路径';


--
-- Name: COLUMN sys_operation_log.request_method; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.request_method IS '请求方式';


--
-- Name: COLUMN sys_operation_log.request_payload; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.request_payload IS '请求体';


--
-- Name: COLUMN sys_operation_log.response_code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.response_code IS '响应状态码';


--
-- Name: COLUMN sys_operation_log.response_json; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.response_json IS '响应体';


--
-- Name: COLUMN sys_operation_log.process_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.process_time IS '处理时间';


--
-- Name: COLUMN sys_operation_log.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.id IS '主键ID';


--
-- Name: COLUMN sys_operation_log.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_operation_log.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.status IS '状态';


--
-- Name: COLUMN sys_operation_log.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.description IS '备注/描述';


--
-- Name: COLUMN sys_operation_log.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.created_time IS '创建时间';


--
-- Name: COLUMN sys_operation_log.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.updated_time IS '更新时间';


--
-- Name: COLUMN sys_operation_log.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_operation_log.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_operation_log.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_operation_log.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.created_id IS '创建人ID';


--
-- Name: COLUMN sys_operation_log.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_operation_log.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_operation_log.deleted_id IS '删除人ID';


--
-- Name: sys_operation_log_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_operation_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_operation_log_id_seq OWNER TO root;

--
-- Name: sys_operation_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_operation_log_id_seq OWNED BY public.sys_operation_log.id;


--
-- Name: sys_param; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_param (
    config_name character varying(64) NOT NULL,
    config_key character varying(500) NOT NULL,
    config_value character varying(500),
    config_type boolean,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.sys_param OWNER TO root;

--
-- Name: TABLE sys_param; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_param IS '系统参数表';


--
-- Name: COLUMN sys_param.config_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.config_name IS '参数名称';


--
-- Name: COLUMN sys_param.config_key; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.config_key IS '参数键名';


--
-- Name: COLUMN sys_param.config_value; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.config_value IS '参数键值';


--
-- Name: COLUMN sys_param.config_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.config_type IS '系统内置(True:是 False:否)';


--
-- Name: COLUMN sys_param.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.id IS '主键ID';


--
-- Name: COLUMN sys_param.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_param.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.status IS '状态';


--
-- Name: COLUMN sys_param.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.description IS '备注/描述';


--
-- Name: COLUMN sys_param.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.created_time IS '创建时间';


--
-- Name: COLUMN sys_param.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.updated_time IS '更新时间';


--
-- Name: COLUMN sys_param.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_param.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_param.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_param.tenant_id IS '租户ID';


--
-- Name: sys_param_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_param_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_param_id_seq OWNER TO root;

--
-- Name: sys_param_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_param_id_seq OWNED BY public.sys_param.id;


--
-- Name: sys_position; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_position (
    name character varying(64) NOT NULL,
    code character varying(64) NOT NULL,
    "order" integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_position OWNER TO root;

--
-- Name: TABLE sys_position; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_position IS '岗位表';


--
-- Name: COLUMN sys_position.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.name IS '岗位名称';


--
-- Name: COLUMN sys_position.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.code IS '岗位编码';


--
-- Name: COLUMN sys_position."order"; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position."order" IS '显示排序';


--
-- Name: COLUMN sys_position.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.id IS '主键ID';


--
-- Name: COLUMN sys_position.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_position.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.status IS '状态';


--
-- Name: COLUMN sys_position.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.description IS '备注/描述';


--
-- Name: COLUMN sys_position.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.created_time IS '创建时间';


--
-- Name: COLUMN sys_position.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.updated_time IS '更新时间';


--
-- Name: COLUMN sys_position.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_position.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_position.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_position.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.created_id IS '创建人ID';


--
-- Name: COLUMN sys_position.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_position.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_position.deleted_id IS '删除人ID';


--
-- Name: sys_position_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_position_id_seq OWNER TO root;

--
-- Name: sys_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_position_id_seq OWNED BY public.sys_position.id;


--
-- Name: sys_role; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_role (
    name character varying(64) NOT NULL,
    code character varying(64) NOT NULL,
    "order" integer NOT NULL,
    data_scope integer NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.sys_role OWNER TO root;

--
-- Name: TABLE sys_role; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_role IS '角色表';


--
-- Name: COLUMN sys_role.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.name IS '角色名称';


--
-- Name: COLUMN sys_role.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.code IS '角色编码';


--
-- Name: COLUMN sys_role."order"; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role."order" IS '显示排序';


--
-- Name: COLUMN sys_role.data_scope; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.data_scope IS '数据权限范围(1:仅本人 2:本部门 3:本部门及以下 4:全部 5:自定义)';


--
-- Name: COLUMN sys_role.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.id IS '主键ID';


--
-- Name: COLUMN sys_role.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_role.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.status IS '状态';


--
-- Name: COLUMN sys_role.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.description IS '备注/描述';


--
-- Name: COLUMN sys_role.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.created_time IS '创建时间';


--
-- Name: COLUMN sys_role.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.updated_time IS '更新时间';


--
-- Name: COLUMN sys_role.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_role.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_role.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role.tenant_id IS '租户ID';


--
-- Name: sys_role_depts; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_role_depts (
    role_id integer NOT NULL,
    dept_id integer NOT NULL
);


ALTER TABLE public.sys_role_depts OWNER TO root;

--
-- Name: TABLE sys_role_depts; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_role_depts IS '角色部门关联表';


--
-- Name: COLUMN sys_role_depts.role_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role_depts.role_id IS '角色ID';


--
-- Name: COLUMN sys_role_depts.dept_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role_depts.dept_id IS '部门ID';


--
-- Name: sys_role_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_role_id_seq OWNER TO root;

--
-- Name: sys_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_role_id_seq OWNED BY public.sys_role.id;


--
-- Name: sys_role_menus; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_role_menus (
    role_id integer NOT NULL,
    menu_id integer NOT NULL
);


ALTER TABLE public.sys_role_menus OWNER TO root;

--
-- Name: TABLE sys_role_menus; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_role_menus IS '角色菜单关联表';


--
-- Name: COLUMN sys_role_menus.role_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role_menus.role_id IS '角色ID';


--
-- Name: COLUMN sys_role_menus.menu_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_role_menus.menu_id IS '菜单ID';


--
-- Name: sys_ticket; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_ticket (
    title character varying(200) NOT NULL,
    ticket_content text,
    summary text,
    ticket_type character varying(20) NOT NULL,
    images text,
    reply text,
    assigned_id integer,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_ticket OWNER TO root;

--
-- Name: TABLE sys_ticket; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_ticket IS '工单表';


--
-- Name: COLUMN sys_ticket.title; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.title IS '工单标题';


--
-- Name: COLUMN sys_ticket.ticket_content; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.ticket_content IS '工单内容（富文本）';


--
-- Name: COLUMN sys_ticket.summary; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.summary IS '工单内容（纯文本摘要）';


--
-- Name: COLUMN sys_ticket.ticket_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.ticket_type IS '工单类型(suggestion:建议 bug:缺陷 optimize:优化 other:其他)';


--
-- Name: COLUMN sys_ticket.images; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.images IS '图片URL列表(JSON数组)';


--
-- Name: COLUMN sys_ticket.reply; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.reply IS '回复内容';


--
-- Name: COLUMN sys_ticket.assigned_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.assigned_id IS '处理人ID';


--
-- Name: COLUMN sys_ticket.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.id IS '主键ID';


--
-- Name: COLUMN sys_ticket.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_ticket.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.status IS '状态';


--
-- Name: COLUMN sys_ticket.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.description IS '备注/描述';


--
-- Name: COLUMN sys_ticket.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.created_time IS '创建时间';


--
-- Name: COLUMN sys_ticket.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.updated_time IS '更新时间';


--
-- Name: COLUMN sys_ticket.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_ticket.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_ticket.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_ticket.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.created_id IS '创建人ID';


--
-- Name: COLUMN sys_ticket.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_ticket.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_ticket.deleted_id IS '删除人ID';


--
-- Name: sys_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_ticket_id_seq OWNER TO root;

--
-- Name: sys_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_ticket_id_seq OWNED BY public.sys_ticket.id;


--
-- Name: sys_user; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_user (
    username character varying(64) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(32) NOT NULL,
    mobile character varying(11),
    email character varying(64),
    gender character varying(1),
    avatar character varying(255),
    is_superuser boolean NOT NULL,
    last_login timestamp with time zone,
    gitee_login character varying(32),
    github_login character varying(32),
    wx_login character varying(32),
    qq_login character varying(32),
    dept_id integer,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.sys_user OWNER TO root;

--
-- Name: TABLE sys_user; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_user IS '用户表';


--
-- Name: COLUMN sys_user.username; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.username IS '用户名/登录账号';


--
-- Name: COLUMN sys_user.password; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.password IS '密码哈希';


--
-- Name: COLUMN sys_user.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.name IS '昵称';


--
-- Name: COLUMN sys_user.mobile; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.mobile IS '手机号';


--
-- Name: COLUMN sys_user.email; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.email IS '邮箱';


--
-- Name: COLUMN sys_user.gender; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.gender IS '性别(0:男 1:女 2:未知)';


--
-- Name: COLUMN sys_user.avatar; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.avatar IS '头像URL地址';


--
-- Name: COLUMN sys_user.is_superuser; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.is_superuser IS '是否超管';


--
-- Name: COLUMN sys_user.last_login; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.last_login IS '最后登录时间';


--
-- Name: COLUMN sys_user.gitee_login; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.gitee_login IS 'Gitee登录';


--
-- Name: COLUMN sys_user.github_login; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.github_login IS 'Github登录';


--
-- Name: COLUMN sys_user.wx_login; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.wx_login IS '微信登录';


--
-- Name: COLUMN sys_user.qq_login; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.qq_login IS 'QQ登录';


--
-- Name: COLUMN sys_user.dept_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.dept_id IS '部门ID';


--
-- Name: COLUMN sys_user.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.id IS '主键ID';


--
-- Name: COLUMN sys_user.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN sys_user.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.status IS '状态';


--
-- Name: COLUMN sys_user.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.description IS '备注/描述';


--
-- Name: COLUMN sys_user.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.created_time IS '创建时间';


--
-- Name: COLUMN sys_user.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.updated_time IS '更新时间';


--
-- Name: COLUMN sys_user.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN sys_user.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.deleted_time IS '删除时间';


--
-- Name: COLUMN sys_user.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.tenant_id IS '租户ID';


--
-- Name: COLUMN sys_user.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.created_id IS '创建人ID';


--
-- Name: COLUMN sys_user.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.updated_id IS '更新人ID';


--
-- Name: COLUMN sys_user.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user.deleted_id IS '删除人ID';


--
-- Name: sys_user_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sys_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_user_id_seq OWNER TO root;

--
-- Name: sys_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sys_user_id_seq OWNED BY public.sys_user.id;


--
-- Name: sys_user_positions; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_user_positions (
    user_id integer NOT NULL,
    position_id integer NOT NULL
);


ALTER TABLE public.sys_user_positions OWNER TO root;

--
-- Name: TABLE sys_user_positions; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_user_positions IS '用户岗位关联表';


--
-- Name: COLUMN sys_user_positions.user_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user_positions.user_id IS '用户ID';


--
-- Name: COLUMN sys_user_positions.position_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user_positions.position_id IS '岗位ID';


--
-- Name: sys_user_roles; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sys_user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.sys_user_roles OWNER TO root;

--
-- Name: TABLE sys_user_roles; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.sys_user_roles IS '用户角色关联表';


--
-- Name: COLUMN sys_user_roles.user_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user_roles.user_id IS '用户ID';


--
-- Name: COLUMN sys_user_roles.role_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.sys_user_roles.role_id IS '角色ID';


--
-- Name: task_job; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.task_job (
    job_id character varying(64) NOT NULL,
    job_name character varying(128),
    trigger_type character varying(32),
    status character varying(16) NOT NULL,
    next_run_time character varying(64),
    job_state text,
    result text,
    error text,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL
);


ALTER TABLE public.task_job OWNER TO root;

--
-- Name: TABLE task_job; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.task_job IS '任务执行日志表';


--
-- Name: COLUMN task_job.job_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.job_id IS '任务ID';


--
-- Name: COLUMN task_job.job_name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.job_name IS '任务名称';


--
-- Name: COLUMN task_job.trigger_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.trigger_type IS '触发方式: cron/interval/date/manual';


--
-- Name: COLUMN task_job.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.status IS '执行状态';


--
-- Name: COLUMN task_job.next_run_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.next_run_time IS '下次执行时间';


--
-- Name: COLUMN task_job.job_state; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.job_state IS '任务状态信息';


--
-- Name: COLUMN task_job.result; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.result IS '执行结果';


--
-- Name: COLUMN task_job.error; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.error IS '错误信息';


--
-- Name: COLUMN task_job.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.id IS '主键ID';


--
-- Name: COLUMN task_job.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN task_job.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.description IS '备注/描述';


--
-- Name: COLUMN task_job.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.created_time IS '创建时间';


--
-- Name: COLUMN task_job.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.updated_time IS '更新时间';


--
-- Name: COLUMN task_job.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN task_job.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.deleted_time IS '删除时间';


--
-- Name: COLUMN task_job.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_job.tenant_id IS '租户ID';


--
-- Name: task_job_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.task_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_job_id_seq OWNER TO root;

--
-- Name: task_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.task_job_id_seq OWNED BY public.task_job.id;


--
-- Name: task_node; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.task_node (
    name character varying(64) NOT NULL,
    code character varying(32) NOT NULL,
    jobstore character varying(64),
    executor character varying(64),
    trigger character varying(64),
    trigger_args text,
    func text,
    args text,
    kwargs text,
    "coalesce" boolean,
    max_instances integer,
    start_date character varying(64),
    end_date character varying(64),
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.task_node OWNER TO root;

--
-- Name: TABLE task_node; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.task_node IS '节点类型表';


--
-- Name: COLUMN task_node.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.name IS '节点名称';


--
-- Name: COLUMN task_node.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.code IS '节点编码';


--
-- Name: COLUMN task_node.jobstore; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.jobstore IS '存储器';


--
-- Name: COLUMN task_node.executor; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.executor IS '执行器';


--
-- Name: COLUMN task_node.trigger; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.trigger IS '触发器';


--
-- Name: COLUMN task_node.trigger_args; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.trigger_args IS '触发器参数';


--
-- Name: COLUMN task_node.func; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.func IS '代码块';


--
-- Name: COLUMN task_node.args; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.args IS '位置参数';


--
-- Name: COLUMN task_node.kwargs; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.kwargs IS '关键字参数';


--
-- Name: COLUMN task_node."coalesce"; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node."coalesce" IS '是否合并运行';


--
-- Name: COLUMN task_node.max_instances; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.max_instances IS '最大实例数';


--
-- Name: COLUMN task_node.start_date; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.start_date IS '开始时间';


--
-- Name: COLUMN task_node.end_date; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.end_date IS '结束时间';


--
-- Name: COLUMN task_node.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.id IS '主键ID';


--
-- Name: COLUMN task_node.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN task_node.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.status IS '状态';


--
-- Name: COLUMN task_node.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.description IS '备注/描述';


--
-- Name: COLUMN task_node.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.created_time IS '创建时间';


--
-- Name: COLUMN task_node.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.updated_time IS '更新时间';


--
-- Name: COLUMN task_node.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN task_node.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.deleted_time IS '删除时间';


--
-- Name: COLUMN task_node.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.tenant_id IS '租户ID';


--
-- Name: COLUMN task_node.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.created_id IS '创建人ID';


--
-- Name: COLUMN task_node.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.updated_id IS '更新人ID';


--
-- Name: COLUMN task_node.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_node.deleted_id IS '删除人ID';


--
-- Name: task_node_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.task_node_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_node_id_seq OWNER TO root;

--
-- Name: task_node_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.task_node_id_seq OWNED BY public.task_node.id;


--
-- Name: task_workflow; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.task_workflow (
    name character varying(128) NOT NULL,
    code character varying(64) NOT NULL,
    workflow_status character varying(32) NOT NULL,
    nodes json,
    edges json,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.task_workflow OWNER TO root;

--
-- Name: TABLE task_workflow; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.task_workflow IS '工作流定义表';


--
-- Name: COLUMN task_workflow.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.name IS '流程名称';


--
-- Name: COLUMN task_workflow.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.code IS '流程编码';


--
-- Name: COLUMN task_workflow.workflow_status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.workflow_status IS '流程状态: draft/published/archived';


--
-- Name: COLUMN task_workflow.nodes; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.nodes IS 'Vue Flow nodes JSON';


--
-- Name: COLUMN task_workflow.edges; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.edges IS 'Vue Flow edges JSON';


--
-- Name: COLUMN task_workflow.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.id IS '主键ID';


--
-- Name: COLUMN task_workflow.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN task_workflow.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.status IS '状态';


--
-- Name: COLUMN task_workflow.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.description IS '备注/描述';


--
-- Name: COLUMN task_workflow.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.created_time IS '创建时间';


--
-- Name: COLUMN task_workflow.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.updated_time IS '更新时间';


--
-- Name: COLUMN task_workflow.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN task_workflow.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.deleted_time IS '删除时间';


--
-- Name: COLUMN task_workflow.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.tenant_id IS '租户ID';


--
-- Name: COLUMN task_workflow.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.created_id IS '创建人ID';


--
-- Name: COLUMN task_workflow.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.updated_id IS '更新人ID';


--
-- Name: COLUMN task_workflow.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow.deleted_id IS '删除人ID';


--
-- Name: task_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.task_workflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_workflow_id_seq OWNER TO root;

--
-- Name: task_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.task_workflow_id_seq OWNED BY public.task_workflow.id;


--
-- Name: task_workflow_node_type; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.task_workflow_node_type (
    name character varying(128) NOT NULL,
    code character varying(64) NOT NULL,
    category character varying(32) NOT NULL,
    func text NOT NULL,
    args text,
    kwargs text,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    id integer NOT NULL,
    uuid character varying(64) NOT NULL,
    status integer NOT NULL,
    description text,
    created_time timestamp without time zone NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_time timestamp without time zone,
    tenant_id integer NOT NULL,
    created_id integer,
    updated_id integer,
    deleted_id integer
);


ALTER TABLE public.task_workflow_node_type OWNER TO root;

--
-- Name: TABLE task_workflow_node_type; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TABLE public.task_workflow_node_type IS '工作流编排节点类型（非定时任务节点）';


--
-- Name: COLUMN task_workflow_node_type.name; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.name IS '显示名称';


--
-- Name: COLUMN task_workflow_node_type.code; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.code IS '节点编码，对应画布 node.type';


--
-- Name: COLUMN task_workflow_node_type.category; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.category IS '分类: trigger/action/condition/control';


--
-- Name: COLUMN task_workflow_node_type.func; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.func IS 'Python 代码块，须定义 handler(*args,**kwargs)';


--
-- Name: COLUMN task_workflow_node_type.args; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.args IS '默认位置参数，逗号分隔';


--
-- Name: COLUMN task_workflow_node_type.kwargs; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.kwargs IS '默认关键字参数 JSON';


--
-- Name: COLUMN task_workflow_node_type.sort_order; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.sort_order IS '排序';


--
-- Name: COLUMN task_workflow_node_type.is_active; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.is_active IS '是否启用';


--
-- Name: COLUMN task_workflow_node_type.id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.id IS '主键ID';


--
-- Name: COLUMN task_workflow_node_type.uuid; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.uuid IS 'UUID全局唯一标识';


--
-- Name: COLUMN task_workflow_node_type.status; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.status IS '状态';


--
-- Name: COLUMN task_workflow_node_type.description; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.description IS '备注/描述';


--
-- Name: COLUMN task_workflow_node_type.created_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.created_time IS '创建时间';


--
-- Name: COLUMN task_workflow_node_type.updated_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.updated_time IS '更新时间';


--
-- Name: COLUMN task_workflow_node_type.is_deleted; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.is_deleted IS '是否已删除(0:未删除 1:已删除)';


--
-- Name: COLUMN task_workflow_node_type.deleted_time; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.deleted_time IS '删除时间';


--
-- Name: COLUMN task_workflow_node_type.tenant_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.tenant_id IS '租户ID';


--
-- Name: COLUMN task_workflow_node_type.created_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.created_id IS '创建人ID';


--
-- Name: COLUMN task_workflow_node_type.updated_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.updated_id IS '更新人ID';


--
-- Name: COLUMN task_workflow_node_type.deleted_id; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON COLUMN public.task_workflow_node_type.deleted_id IS '删除人ID';


--
-- Name: task_workflow_node_type_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.task_workflow_node_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_workflow_node_type_id_seq OWNER TO root;

--
-- Name: task_workflow_node_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.task_workflow_node_type_id_seq OWNED BY public.task_workflow_node_type.id;


--
-- Name: example_demo id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo ALTER COLUMN id SET DEFAULT nextval('public.example_demo_id_seq'::regclass);


--
-- Name: gen_table id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table ALTER COLUMN id SET DEFAULT nextval('public.gen_table_id_seq'::regclass);


--
-- Name: gen_table_column id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column ALTER COLUMN id SET DEFAULT nextval('public.gen_table_column_id_seq'::regclass);


--
-- Name: platform_email_config id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_config ALTER COLUMN id SET DEFAULT nextval('public.platform_email_config_id_seq'::regclass);


--
-- Name: platform_email_log id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_log ALTER COLUMN id SET DEFAULT nextval('public.platform_email_log_id_seq'::regclass);


--
-- Name: platform_email_template id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_template ALTER COLUMN id SET DEFAULT nextval('public.platform_email_template_id_seq'::regclass);


--
-- Name: platform_invoice id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice ALTER COLUMN id SET DEFAULT nextval('public.platform_invoice_id_seq'::regclass);


--
-- Name: platform_menu id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_menu ALTER COLUMN id SET DEFAULT nextval('public.platform_menu_id_seq'::regclass);


--
-- Name: platform_order id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order ALTER COLUMN id SET DEFAULT nextval('public.platform_order_id_seq'::regclass);


--
-- Name: platform_package id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package ALTER COLUMN id SET DEFAULT nextval('public.platform_package_id_seq'::regclass);


--
-- Name: platform_package_menu id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_menu ALTER COLUMN id SET DEFAULT nextval('public.platform_package_menu_id_seq'::regclass);


--
-- Name: platform_package_plugin id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_plugin ALTER COLUMN id SET DEFAULT nextval('public.platform_package_plugin_id_seq'::regclass);


--
-- Name: platform_payment_record id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_payment_record ALTER COLUMN id SET DEFAULT nextval('public.platform_payment_record_id_seq'::regclass);


--
-- Name: platform_plugin id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_plugin ALTER COLUMN id SET DEFAULT nextval('public.platform_plugin_id_seq'::regclass);


--
-- Name: platform_refund id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund ALTER COLUMN id SET DEFAULT nextval('public.platform_refund_id_seq'::regclass);


--
-- Name: platform_tenant id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant ALTER COLUMN id SET DEFAULT nextval('public.platform_tenant_id_seq'::regclass);


--
-- Name: platform_tenant_plugin id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant_plugin ALTER COLUMN id SET DEFAULT nextval('public.platform_tenant_plugin_id_seq'::regclass);


--
-- Name: platform_user_tenant id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_user_tenant ALTER COLUMN id SET DEFAULT nextval('public.platform_user_tenant_id_seq'::regclass);


--
-- Name: sys_dept id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dept ALTER COLUMN id SET DEFAULT nextval('public.sys_dept_id_seq'::regclass);


--
-- Name: sys_dict_data id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_data ALTER COLUMN id SET DEFAULT nextval('public.sys_dict_data_id_seq'::regclass);


--
-- Name: sys_dict_type id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_type ALTER COLUMN id SET DEFAULT nextval('public.sys_dict_type_id_seq'::regclass);


--
-- Name: sys_login_log id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log ALTER COLUMN id SET DEFAULT nextval('public.sys_login_log_id_seq'::regclass);


--
-- Name: sys_notice id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice ALTER COLUMN id SET DEFAULT nextval('public.sys_notice_id_seq'::regclass);


--
-- Name: sys_operation_log id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log ALTER COLUMN id SET DEFAULT nextval('public.sys_operation_log_id_seq'::regclass);


--
-- Name: sys_param id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_param ALTER COLUMN id SET DEFAULT nextval('public.sys_param_id_seq'::regclass);


--
-- Name: sys_position id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position ALTER COLUMN id SET DEFAULT nextval('public.sys_position_id_seq'::regclass);


--
-- Name: sys_role id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role ALTER COLUMN id SET DEFAULT nextval('public.sys_role_id_seq'::regclass);


--
-- Name: sys_ticket id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket ALTER COLUMN id SET DEFAULT nextval('public.sys_ticket_id_seq'::regclass);


--
-- Name: sys_user id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user ALTER COLUMN id SET DEFAULT nextval('public.sys_user_id_seq'::regclass);


--
-- Name: task_job id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_job ALTER COLUMN id SET DEFAULT nextval('public.task_job_id_seq'::regclass);


--
-- Name: task_node id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node ALTER COLUMN id SET DEFAULT nextval('public.task_node_id_seq'::regclass);


--
-- Name: task_workflow id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow ALTER COLUMN id SET DEFAULT nextval('public.task_workflow_id_seq'::regclass);


--
-- Name: task_workflow_node_type id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type ALTER COLUMN id SET DEFAULT nextval('public.task_workflow_node_type_id_seq'::regclass);


--
-- Data for Name: apscheduler_jobs; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.apscheduler_jobs (id, next_run_time, job_state) FROM stdin;
\.


--
-- Data for Name: example_demo; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.example_demo (name, int_val, bigint_val, float_val, bool_val, date_val, time_val, datetime_val, text_val, json_val, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
用户管理模块	15	15000	99.99	t	2025-06-01	09:00:00	2025-06-01 09:00:00	用户管理模块提供用户注册、登录、权限分配、个人中心等完整功能。	{"version": "1.0", "author": "admin", "tags": ["user", "auth"]}	1	50172c3d-dea9-40ff-955b-d74eb536c716	0	用户管理核心模块	2026-06-17 00:21:30.469739	2026-06-17 00:21:30.46974	f	\N	1	\N	\N	\N
订单支付模块	28	300000	199.5	t	2025-06-15	14:30:00	2025-06-15 14:30:00	订单支付模块支持微信支付、支付宝、银行卡等多种支付方式，包含支付回调、退款处理等。	{"version": "2.1", "author": "payment-team", "tags": ["order", "payment", "refund"]}	2	0ba4898e-fa57-4393-ba0a-e1d610f1641b	0	订单与支付核心模块	2026-06-17 00:21:30.469745	2026-06-17 00:21:30.469745	f	\N	1	\N	\N	\N
消息通知模块	8	5000	0	f	2025-07-01	08:00:00	2025-07-01 08:00:00	消息通知模块支持站内信、邮件、短信等多渠道通知推送。	{"version": "0.9", "author": "dev-team", "tags": ["notification", "email", "sms"]}	3	b6d3a38e-3de6-498b-91ad-642432f3d975	1	消息通知服务模块（开发中）	2026-06-17 00:21:30.469749	2026-06-17 00:21:30.469749	f	\N	1	\N	\N	\N
数据分析报表	42	1000000	499	t	2025-08-01	10:00:00	2025-08-01 10:00:00	数据分析报表模块提供可视化图表、数据导出、实时监控大屏等高级分析功能。	{"version": "3.0", "author": "data-team", "tags": ["analytics", "dashboard", "report", "chart"]}	4	620a8ddd-4fc0-474e-8a90-24fd7bef3241	0	高级数据分析与报表模块	2026-06-17 00:21:30.469752	2026-06-17 00:21:30.469753	f	\N	1	\N	\N	\N
文件存储服务	20	50000	29.9	t	2025-09-01	16:00:00	2025-09-01 16:00:00	文件存储服务支持本地存储、阿里云OSS、腾讯云COS等多种存储后端，提供文件上传、下载、预览等接口。	{"version": "1.5", "author": "infra-team", "tags": ["storage", "oss", "upload"]}	5	2ebeaedb-1703-4bbe-990e-8071d3939f0d	0	文件存储与 CDN 加速服务	2026-06-17 00:21:30.469756	2026-06-17 00:21:30.469756	f	\N	1	\N	\N	\N
测试占位模块	\N	\N	\N	t	\N	\N	\N	\N	null	6	52ec1cae-587f-4ddb-9099-40bc5fae6157	1	仅用于测试空值处理	2026-06-17 00:21:30.469759	2026-06-17 00:21:30.469759	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: gen_table; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.gen_table (table_name, table_comment, class_name, package_name, module_name, business_name, function_name, sub_table_name, sub_table_fk_name, parent_menu_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
\.


--
-- Data for Name: gen_table_column; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.gen_table_column (column_name, column_comment, column_type, column_length, column_default, is_pk, is_increment, is_nullable, is_unique, python_type, python_field, is_insert, is_edit, is_list, is_query, query_type, html_type, dict_type, sort, table_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
\.


--
-- Data for Name: platform_email_config; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_email_config (name, smtp_host, smtp_port, smtp_user, smtp_password, from_name, use_tls, is_default, timeout, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
默认SMTP	smtp.example.com	465	noreply@fastapiadmin.com	PLACEHOLDER_AES_ENCRYPTED	FastapiAdmin	t	t	30	1	a710c21e-ee21-48bb-bdfc-1775dc407f41	0	平台默认SMTP配置	2026-06-17 00:21:30.40262	2026-06-17 00:21:30.402621	f	\N
\.


--
-- Data for Name: platform_email_log; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_email_log (config_id, template_code, to_email, to_name, subject, biz_type, error_msg, retry_count, tenant_id, sent_time, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
\.


--
-- Data for Name: platform_email_template; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_email_template (name, template_code, subject, body_html, body_text, variables, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
注册验证码	register_code	【FastapiAdmin】注册验证码	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#1a1a2e;margin-top:0;'>欢迎注册 FastapiAdmin</h2><p style='color:#666;font-size:15px;line-height:1.8;'>{username} 您好：</p><p style='color:#666;font-size:15px;line-height:1.8;'>您的验证码是：</p><div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:16px 24px;border-radius:6px;text-align:center;margin:20px 0;'><span style='color:#fff;font-size:28px;font-weight:bold;letter-spacing:6px;'>{{ code }}</span></div><p style='color:#999;font-size:13px;line-height:1.6;'>验证码 5 分钟内有效，请勿泄露给他人。</p><hr style='border:none;border-top:1px solid #eee;margin:24px 0;'><p style='color:#bbb;font-size:12px;text-align:center;'>此邮件由系统自动发送，请勿回复。</p></div></div>	欢迎注册 FastapiAdmin\n\n{username} 您好：\n\n您的验证码是：{{ code }}\n\n验证码 5 分钟内有效，请勿泄露给他人。\n\n此邮件由系统自动发送，请勿回复。	{"username":"用户名","code":"验证码"}	1	380602f5-3d86-4110-83de-f5e51fd15211	0	用户注册发送邮箱验证码	2026-06-17 00:21:30.405438	2026-06-17 00:21:30.405439	f	\N
密码重置	reset_password	【FastapiAdmin】密码重置	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#1a1a2e;margin-top:0;'>密码重置</h2><p style='color:#666;font-size:15px;line-height:1.8;'>{username} 您好：</p><p style='color:#666;font-size:15px;line-height:1.8;'>您正在申请重置密码，点击下方链接设置新密码（30 分钟内有效）：</p><div style='text-align:center;margin:24px 0;'><a href='{{ reset_link }}' style='display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;'>重置密码</a></div><p style='color:#999;font-size:13px;'>如非本人操作，请忽略此邮件。</p><hr style='border:none;border-top:1px solid #eee;margin:24px 0;'><p style='color:#bbb;font-size:12px;text-align:center;'>此邮件由系统自动发送，请勿回复。</p></div></div>	密码重置\n\n{username} 您好：\n\n您正在申请重置密码，请点击以下链接设置新密码（30 分钟内有效）：\n{{ reset_link }}\n\n如非本人操作，请忽略此邮件。\n\n此邮件由系统自动发送，请勿回复。	{"username":"用户名","reset_link":"密码重置链接"}	2	96231adc-93cf-4a43-b211-057569b541c9	0	忘记密码发送重置链接	2026-06-17 00:21:30.405443	2026-06-17 00:21:30.405443	f	\N
工单回复通知	ticket_reply	【FastapiAdmin】工单回复通知 - {{ ticket_title }}	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#1a1a2e;margin-top:0;'>工单回复通知</h2><p style='color:#666;font-size:15px;line-height:1.8;'>您的工单 <strong>{{ ticket_title }}</strong> 收到新回复：</p><div style='background:#f8f9fb;border-left:4px solid #667eea;padding:16px 20px;margin:16px 0;border-radius:4px;'><p style='color:#444;font-size:14px;line-height:1.8;margin:0;'>{{ reply_content }}</p></div><p style='color:#999;font-size:13px;'>回复时间：{{ reply_time }}</p></div></div>	工单回复通知\n\n您的工单「{{ ticket_title }}」收到新回复：\n\n{{ reply_content }}\n\n回复时间：{{ reply_time }}	{"ticket_title":"工单标题","reply_content":"回复内容","reply_time":"回复时间"}	3	42762e8e-5b71-48a2-a271-0dd6baa7a978	0	工单被回复时通知提交人	2026-06-17 00:21:30.405447	2026-06-17 00:21:30.405447	f	\N
套餐到期提醒	expiry_warning	【FastapiAdmin】套餐即将到期提醒	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#e74c3c;margin-top:0;'>套餐即将到期</h2><p style='color:#666;font-size:15px;line-height:1.8;'>尊敬的 {{ tenant_name }}：</p><p style='color:#666;font-size:15px;line-height:1.8;'>您的 <strong>{{ package_name }}</strong> 套餐将于 <strong style='color:#e74c3c;'>{{ expire_date }}</strong> 到期，剩余 <strong style='color:#e74c3c;'>{{ remaining_days }}</strong> 天。</p><p style='color:#666;font-size:15px;line-height:1.8;'>到期后部分功能将受限，请及时续费以保证服务正常使用。</p><div style='text-align:center;margin:24px 0;'><a href='{{ renew_link }}' style='display:inline-block;background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;'>立即续费</a></div></div></div>	套餐即将到期\n\n尊敬的 {{ tenant_name }}：您的「{{ package_name }}」套餐将于 {{ expire_date }} 到期，剩余 {{ remaining_days }} 天。请及时续费。\n续费链接：{{ renew_link }}	{"tenant_name":"租户名称","package_name":"套餐名称","expire_date":"到期日期","remaining_days":"剩余天数","renew_link":"续费链接"}	4	5999eb28-52b6-42bc-91ac-7e8932b88d67	0	套餐到期前7/3/1天发送提醒	2026-06-17 00:21:30.40545	2026-06-17 00:21:30.40545	f	\N
团队邀请	team_invite	【FastapiAdmin】{{ tenant_name }} 邀请您加入团队	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#1a1a2e;margin-top:0;'>团队邀请</h2><p style='color:#666;font-size:15px;line-height:1.8;'>您好：</p><p style='color:#666;font-size:15px;line-height:1.8;'><strong>{{ inviter_name }}</strong> 邀请您加入 <strong>{{ tenant_name }}</strong> 团队。</p><div style='text-align:center;margin:24px 0;'><a href='{{ invite_link }}' style='display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;'>接受邀请</a></div><p style='color:#999;font-size:13px;'>链接 24 小时内有效。</p></div></div>	团队邀请\n\n您好：{{ inviter_name }} 邀请您加入 {{ tenant_name }} 团队。\n点击链接接受邀请：{{ invite_link }}\n链接 24 小时内有效。	{"tenant_name":"团队名称","inviter_name":"邀请人姓名","invite_link":"邀请链接"}	5	e7f4c392-9544-46f2-9e94-8655274d2cec	0	邀请新成员加入团队	2026-06-17 00:21:30.405454	2026-06-17 00:21:30.405454	f	\N
发票开具通知	invoice_issued	【FastapiAdmin】发票已开具 - {{ invoice_no }}	<div style='max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background:#f5f7fa;border-radius:8px;'><div style='background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);'><h2 style='color:#1a1a2e;margin-top:0;'>发票已开具</h2><p style='color:#666;font-size:15px;line-height:1.8;'>尊敬的客户：</p><p style='color:#666;font-size:15px;line-height:1.8;'>您的发票已开具完成：</p><table style='width:100%;border-collapse:collapse;margin:16px 0;'><tr><td style='padding:8px 12px;color:#888;'>发票号码</td><td style='padding:8px 12px;color:#333;'>{{ invoice_no }}</td></tr><tr style='background:#f8f9fb;'><td style='padding:8px 12px;color:#888;'>发票抬头</td><td style='padding:8px 12px;color:#333;'>{{ invoice_title }}</td></tr><tr><td style='padding:8px 12px;color:#888;'>开票金额</td><td style='padding:8px 12px;color:#333;font-weight:bold;'>¥{{ invoice_amount }}</td></tr></table><div style='text-align:center;margin:20px 0;'><a href='{{ pdf_link }}' style='display:inline-block;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;'>下载 PDF 电子发票</a></div></div></div>	发票已开具\n\n尊敬的客户：您的发票已开具完成。\n发票号码：{{ invoice_no }}\n发票抬头：{{ invoice_title }}\n开票金额：¥{{ invoice_amount }}\n下载 PDF：{{ pdf_link }}	{"invoice_no":"发票号","invoice_title":"发票抬头","invoice_amount":"开票金额","pdf_link":"PDF下载链接"}	6	f79c3109-f1ef-44db-8dcc-11d2c2df95d3	0	发票开具完成通知客户	2026-06-17 00:21:30.405457	2026-06-17 00:21:30.405457	f	\N
\.


--
-- Data for Name: platform_invoice; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_invoice (invoice_no, order_id, invoice_type, title, tax_no, bank_info, address_info, amount, tax_amount, pdf_url, api_response, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
INV20260101001	1	vat_special	星辰科技有限公司	91440300MA5ABCDE12	中国工商银行深圳科技园支行 4000023409100123456	深圳市南山区科技园路1号 0755-88888888	29900	4485	\N	\N	1	201c7aa4-a579-498b-8d99-b7ed103d6a48	1	星辰科技-标准版年付发票（已开具）	2026-06-17 00:21:30.415418	2026-06-17 00:21:30.415419	f	\N	3
INV20260315001	2	vat_normal	星辰科技有限公司	\N	\N	\N	9900	1485	\N	\N	2	d4d54258-1d97-4ec7-aacb-2508d52583ad	1	星辰科技-AI助手发票（已开具）	2026-06-17 00:21:30.415423	2026-06-17 00:21:30.415424	f	\N	3
INV20260601001	6	vat_normal	创新工坊	\N	\N	\N	29900	4485	\N	\N	3	8d908d0d-2092-49de-832e-442385e90630	0	创新工坊-标准版月付发票（待开具）	2026-06-17 00:21:30.415427	2026-06-17 00:21:30.415427	f	\N	4
INV20260610001	7	vat_normal	创新工坊	\N	\N	\N	4900	735	\N	\N	4	7f05de0f-0f19-4475-b051-85312b83dfcf	0	创新工坊-数据大屏发票（待开具）	2026-06-17 00:21:30.41543	2026-06-17 00:21:30.415431	f	\N	4
\.


--
-- Data for Name: platform_menu; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_menu (name, type, "order", permission, icon, route_name, route_path, component_path, redirect, hidden, keep_alive, always_show, title, params, affix, client, link, is_iframe, is_hide_tab, active_path, show_badge, show_text_badge, scope, parent_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
平台管理	1	1	\N	ri:building-4-line	Platform	/platform	\N	/platform/menu	f	t	t	平台管理	null	f	pc	\N	f	f	\N	f	\N	tenant	\N	1	98577f64-991b-4e40-afb1-54d26a40731b	0	初始化数据	2026-06-17 00:21:30.336526	2026-06-17 00:21:30.33653	f	\N
系统管理	1	2	\N	ri:settings-2-line	System	/system	\N	/system/dept	f	t	f	系统管理	null	f	pc	\N	f	f	\N	f	\N	tenant	\N	2	c7bd15ee-16e1-42cf-aa5c-c9d6f3bf9e9d	0	初始化数据	2026-06-17 00:21:30.336534	2026-06-17 00:21:30.336535	f	\N
监控管理	1	3	\N	ri:computer-line	Monitor	/monitor	\N	/monitor/online	f	t	f	监控管理	null	f	pc	\N	f	f	\N	t	NEW	platform	\N	3	470cfcc1-881c-4267-b809-0d0a6e6cd9e7	0	初始化数据	2026-06-17 00:21:30.336538	2026-06-17 00:21:30.336539	f	\N
接口管理	1	4	\N	ri:file-text-line	Swagger	/swagger	\N	/swagger/docs	f	t	f	接口管理	null	f	pc	\N	f	f	\N	f	\N	platform	\N	4	ce89e9ed-c699-4cf1-8445-a12f042d08e9	0	初始化数据	2026-06-17 00:21:30.336542	2026-06-17 00:21:30.336542	f	\N
代码管理	1	5	\N	ri:code-s-slash-line	Generator	/generator	\N	/generator/gencode	f	t	f	代码管理	null	f	pc	\N	f	f	\N	t	DEV	platform	\N	5	c700d7e7-2b07-4982-a6e9-57089ffae946	0	代码管理	2026-06-17 00:21:30.336545	2026-06-17 00:21:30.336545	f	\N
AI管理	1	7	\N	ri:chat-3-line	AI	/ai	\N	/ai/chat	f	t	f	AI管理	null	f	pc	\N	f	f	\N	t	HOT	platform	\N	6	85fc3718-d424-4a2a-977c-ccd1faffff04	0	AI管理	2026-06-17 00:21:30.336548	2026-06-17 00:21:30.336549	f	\N
任务管理	1	8	\N	ri:tools-line	Task	/task	\N	/task/cronjob/job	f	t	f	任务管理	null	f	pc	\N	f	f	\N	t	BETA	platform	\N	7	92909e2c-3ab1-4257-bbd9-d2eca672d59c	0	任务管理	2026-06-17 00:21:30.336551	2026-06-17 00:21:30.336552	f	\N
案例管理	1	9	\N	ri:menu-line	Example	/example	\N	/example/demo-center/demo	f	t	f	案例管理	null	f	pc	\N	f	f	\N	t	BETA	tenant	\N	8	d7154f5c-ff46-4eee-a936-bae32f909090	0	案例管理	2026-06-17 00:21:30.336555	2026-06-17 00:21:30.336555	f	\N
首页	1	90		ri:home-4-line	AppHome	/app/home	\N	/app/home	f	t	t	首页	null	f	app	\N	f	f	\N	f	\N	tenant	\N	9	f0e4cab7-de47-416b-9d46-1b5d02298adc	0	APP 移动端-首页	2026-06-17 00:21:30.336558	2026-06-17 00:21:30.336558	f	\N
同事	1	91		ri:user-heart-line	AppColleague	/app/colleague	\N	/app/colleague	f	t	t	同事	null	f	app	\N	f	f	\N	f	\N	tenant	\N	10	292ed368-e7b9-4ff4-830b-f619883d504e	0	APP 移动端-同事	2026-06-17 00:21:30.336561	2026-06-17 00:21:30.336561	f	\N
打卡	1	92		ri:time-line	AppAttendance	/app/attendance	\N	/app/attendance	f	t	t	打卡	null	f	app	\N	f	f	\N	f	\N	tenant	\N	11	209f7ef8-90ee-4519-ae10-9c6eba783ff4	0	APP 移动端-打卡	2026-06-17 00:21:30.336564	2026-06-17 00:21:30.336565	f	\N
消息	1	93		ri:message-3-line	AppMessage	/app/message	\N	/app/message	f	t	t	消息	null	f	app	\N	f	f	\N	f	\N	tenant	\N	12	01233ec6-889e-46ec-a317-ac9f08da8104	0	APP 移动端-消息	2026-06-17 00:21:30.336568	2026-06-17 00:21:30.336568	f	\N
我的	1	94		ri:user-line	AppMine	/app/mine	\N	/app/mine	f	t	t	我的	null	f	app	\N	f	f	\N	f	\N	tenant	\N	13	5994b724-3f02-4168-b39f-b02b4be33748	0	APP 移动端-我的	2026-06-17 00:21:30.336571	2026-06-17 00:21:30.336572	f	\N
菜单管理	2	1	module_platform:menu:query	ri:menu-line	Menu	menu	module_platform/menu/index	\N	f	t	f	菜单管理	null	f	pc	\N	f	f	\N	f	\N	tenant	1	14	36ef4734-9a42-46e4-ae1e-72b170424252	0	初始化数据	2026-06-17 00:21:30.339748	2026-06-17 00:21:30.33975	f	\N
租户管理	2	2	module_system:tenant:query	ri:presentation-line	Tenant	tenant	module_platform/tenant/index	\N	f	t	f	租户管理	null	f	pc	\N	f	f	\N	f	\N	platform	1	15	26f15d47-827d-40fc-aab7-a6e2938494d8	0	初始化数据	2026-06-17 00:21:30.339754	2026-06-17 00:21:30.339755	f	\N
套餐管理	2	3	module_package:package:query	ri:vip-crown-2-line	Package	package	module_platform/package/index	\N	f	t	f	套餐管理	null	f	pc	\N	f	f	\N	f	\N	platform	1	16	1860aba7-c95f-4064-bbb1-ed3e78b176bf	0	套餐管理菜单	2026-06-17 00:21:30.339758	2026-06-17 00:21:30.339759	f	\N
邮件管理	2	5	module_platform:email:*	ri:mail-send-line	Email	email	module_platform/email/index	\N	f	t	f	邮件管理	null	f	pc	\N	f	f	\N	f	\N	platform	1	17	365788ec-d516-4e53-b431-0c765d21e559	0	系统邮件服务管理	2026-06-17 00:21:30.339762	2026-06-17 00:21:30.339762	f	\N
订单管理	2	7	module_platform:order:query	ri:file-list-3-line	PlatformOrder	order	module_platform/order/index	\N	f	t	f	订单管理	null	f	pc	\N	f	f	\N	f	\N	platform	1	18	6edc5f34-8e00-4940-ac64-2ec97a90bf63	0	初始化数据	2026-06-17 00:21:30.339765	2026-06-17 00:21:30.339765	f	\N
发票管理	2	9	module_platform:invoice:query	ri:file-text-line	PlatformInvoice	invoice	module_platform/invoice/index	\N	f	t	f	发票管理	null	f	pc	\N	f	f	\N	f	\N	platform	1	19	147b0639-a4ed-4d07-9b6f-eb27eba05956	0	初始化数据	2026-06-17 00:21:30.339768	2026-06-17 00:21:30.339769	f	\N
租户工作台	2	13	module_platform:workspace:query	ri:briefcase-line	PlatformWorkspace	workspace	module_platform/self_service/index	\N	f	t	f	租户工作台	null	f	pc	\N	f	f	\N	f	\N	platform	1	20	5dacd640-a72d-4ed8-a051-44c9920d26d9	0	初始化数据	2026-06-17 00:21:30.339772	2026-06-17 00:21:30.339772	f	\N
插件市场	2	14	module_platform:plugin:query	ri:store-2-line	PluginMarket	plugin-market	module_platform/plugin/index	\N	f	t	f	插件市场	null	f	pc	\N	f	f	\N	t	NEW	platform	1	21	cba9f4a7-244a-4a0f-ad5c-5750c574091d	0	初始化数据	2026-06-17 00:21:30.339775	2026-06-17 00:21:30.339776	f	\N
字典管理	2	1	module_system:dict_type:query	ri:book-2-line	Dict	dict	module_system/dict/index	\N	f	t	f	字典管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	22	f17c74b4-e48c-440e-ae18-e553417bd5c4	0	初始化数据	2026-06-17 00:21:30.339778	2026-06-17 00:21:30.339779	f	\N
参数管理	2	2	module_system:param:query	ri:settings-3-line	Params	param	module_system/params/index	\N	f	t	f	参数管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	23	7d130d8b-6e67-4966-87bc-473045dccd80	0	初始化数据	2026-06-17 00:21:30.339782	2026-06-17 00:21:30.339782	f	\N
部门管理	2	3	module_system:dept:query	ri:node-tree	Dept	dept	module_system/dept/index	\N	f	t	f	部门管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	24	b38ec7d5-19f3-433a-ab16-57c0df3f2ca6	0	初始化数据	2026-06-17 00:21:30.339785	2026-06-17 00:21:30.339785	f	\N
岗位管理	2	4	module_system:position:query	ri:map-pin-line	Position	position	module_system/position/index	\N	f	t	f	岗位管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	25	7e2b8a38-b591-4b56-b4b6-7ae9c6bd3f40	0	初始化数据	2026-06-17 00:21:30.339788	2026-06-17 00:21:30.339788	f	\N
角色管理	2	5	module_system:role:query	ri:admin-line	Role	role	module_system/role/index	\N	f	t	f	角色管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	26	c7afe61e-2c4e-4389-a470-3ae5fa21b344	0	初始化数据	2026-06-17 00:21:30.339791	2026-06-17 00:21:30.339792	f	\N
用户管理	2	6	module_system:user:query	ri:user-line	User	user	module_system/user/index	\N	f	t	f	用户管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	27	ccf8f0ff-7b5d-419b-a131-9f6442c60cea	0	初始化数据	2026-06-17 00:21:30.339794	2026-06-17 00:21:30.339795	f	\N
日志管理	2	7	module_system:log:query	ri:focus-3-line	Log	log	module_system/log/index	\N	f	t	f	日志管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	28	993d5dfa-4145-45e1-836d-8ff8acc62381	0	初始化数据	2026-06-17 00:21:30.339798	2026-06-17 00:21:30.339798	f	\N
公告管理	2	8	module_system:notice:query	ri:notification-3-line	Notice	notice	module_system/notice/index	\N	f	t	f	公告管理	null	f	pc	\N	f	f	\N	f	\N	tenant	2	29	33506696-6041-4a95-baa7-880b7009f1bd	0	初始化数据	2026-06-17 00:21:30.339801	2026-06-17 00:21:30.339801	f	\N
工单管理	2	10	module_system:ticket:query	ri:feedback-line	ModuleTicket	ticket	module_system/ticket/index	\N	f	t	f	工单管理	null	f	pc	\N	f	f	\N	t	NEW	tenant	2	30	825c13b7-0477-4621-8c04-90a6e9ebfb4d	0	初始化数据	2026-06-17 00:21:30.339804	2026-06-17 00:21:30.339804	f	\N
系统配置	3	99	module_system:config:update	\N	\N	\N	\N	\N	f	t	f	系统配置	null	f	pc	\N	f	f	\N	f	\N	platform	2	31	bc2e8f9e-4482-42fa-a1fd-ba507ad23922	0	初始化数据	2026-06-17 00:21:30.339807	2026-06-17 00:21:30.339808	f	\N
在线用户	2	1	module_monitor:online:query	ri:customer-service-2-line	MonitorOnline	online	module_monitor/online/index	\N	f	t	f	在线用户	null	f	pc	\N	f	f	\N	f	\N	platform	3	32	4169f2e2-6217-43da-9c9d-76fbfefa56ec	0	初始化数据	2026-06-17 00:21:30.33981	2026-06-17 00:21:30.339811	f	\N
服务器监控	2	2	module_monitor:server:query	ri:dashboard-3-line	MonitorServer	server	module_monitor/server/index	\N	f	t	f	服务器监控	null	f	pc	\N	f	f	\N	f	\N	platform	3	33	370a106d-b337-4e47-8477-c6c8954dbe3d	0	初始化数据	2026-06-17 00:21:30.339814	2026-06-17 00:21:30.339814	f	\N
缓存监控	2	3	module_monitor:cache:query	ri:timer-flash-line	MonitorCache	cache	module_monitor/cache/index	\N	f	t	f	缓存监控	null	f	pc	\N	f	f	\N	f	\N	platform	3	34	d493fefd-ba83-4c2a-a4b8-3f32124c9373	0	初始化数据	2026-06-17 00:21:30.339817	2026-06-17 00:21:30.339817	f	\N
文件管理	2	4	module_monitor:resource:query	ri:folder-5-line	Resource	resource	module_monitor/resource/index	\N	f	t	f	文件管理	null	f	pc	\N	f	f	\N	f	\N	platform	3	35	e60509c7-779d-4d56-9cf5-ef95c2dca891	0	初始化数据	2026-06-17 00:21:30.33982	2026-06-17 00:21:30.33982	f	\N
Swagger文档	4	1	module_swagger:docs:query	ri:plug-line	Docs	docs	module_swagger/docs/index	\N	f	t	f	Swagger文档	null	f	pc	/api/v1/docs	t	f	\N	f	\N	platform	4	36	316d315e-3250-444d-9f0d-7cede428b217	0	初始化数据	2026-06-17 00:21:30.339823	2026-06-17 00:21:30.339824	f	\N
Redoc文档	4	2	module_swagger:redoc:query	ri:file-text-line	Redoc	redoc	module_swagger/redoc/index	\N	f	t	f	Redoc文档	null	f	pc	/api/v1/redoc	t	f	\N	f	\N	platform	4	37	74f423c9-c973-4401-b35d-2abe7bd71381	0	初始化数据	2026-06-17 00:21:30.339826	2026-06-17 00:21:30.339827	f	\N
代码生成	2	1	module_generator:gencode:query	ri:code-s-slash-line	GenCode	gencode	module_generator/gencode/index	\N	f	t	f	代码生成	null	f	pc	\N	f	f	\N	f	\N	platform	5	38	11a1e002-acdb-4ab6-8f0b-06c24642c6d2	0	代码生成	2026-06-17 00:21:30.339829	2026-06-17 00:21:30.33983	f	\N
AI智能助手	2	1	module_ai:chat:query	ri:message-2-line	Chat	chat	module_ai/chat/index	\N	f	t	f	AI智能助手	null	f	pc	\N	f	f	\N	f	\N	platform	6	39	411d5171-d4a7-4431-992b-c03a06dda8a9	0	AI智能助手	2026-06-17 00:21:30.339833	2026-06-17 00:21:30.339833	f	\N
会话记忆	2	2	module_ai:chat:query	ri:chat-3-line	Memory	memory	module_ai/memory/index	\N	f	t	f	会话记忆	null	f	pc	\N	f	f	\N	f	\N	platform	6	40	9140f8ce-4839-4a92-b309-0462706b71e6	0	会话记忆管理	2026-06-17 00:21:30.339836	2026-06-17 00:21:30.339836	f	\N
定时任务	1	1	\N	ri:timer-line	Cronjob	cronjob	\N	/task/cronjob/job	f	t	t	定时任务	null	f	pc	\N	f	f	\N	f	\N	platform	7	41	a81360fd-bd04-476b-8423-7ab1de407793	0	APScheduler 调度器与任务节点	2026-06-17 00:21:30.339839	2026-06-17 00:21:30.339839	f	\N
工作流	1	2	\N	ri:tools-line	WorkflowMgr	workflow-mgr	\N	/task/workflow/definition	f	t	t	工作流	null	f	pc	\N	f	f	\N	f	\N	platform	7	42	b35b13c7-5350-4a5e-ad89-9902b8927d03	0	流程编排与编排节点类型	2026-06-17 00:21:30.339842	2026-06-17 00:21:30.339842	f	\N
示例中心	1	1	\N	ri:apps-line	DemoCenter	demo-center	\N	/example/demo-center/demo	f	t	f	示例中心	null	f	pc	\N	f	f	\N	f	\N	tenant	8	43	7ba53660-6512-4213-985d-fe33155a1c12	0	示例中心	2026-06-17 00:21:30.339845	2026-06-17 00:21:30.339846	f	\N
新增	3	1	module_platform:menu:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	14	44	5d1abaa8-a6cd-41c1-898b-74788409476f	0	初始化数据	2026-06-17 00:21:30.344936	2026-06-17 00:21:30.344939	f	\N
编辑	3	2	module_platform:menu:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	14	45	f13f38b0-0fe3-4791-b995-11df5b8d7048	0	初始化数据	2026-06-17 00:21:30.344943	2026-06-17 00:21:30.344943	f	\N
删除	3	3	module_platform:menu:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	14	46	9185dec6-4bdd-4a0e-93ad-3610a9baa23f	0	初始化数据	2026-06-17 00:21:30.344946	2026-06-17 00:21:30.344947	f	\N
状态变更	3	4	module_platform:menu:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	14	47	1e136423-1a71-4de3-a3a0-d4bb29d26446	0	初始化数据	2026-06-17 00:21:30.34495	2026-06-17 00:21:30.34495	f	\N
详情	3	5	module_platform:menu:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	14	48	59199ffd-aee8-4f0f-823a-7a87e6596647	0	初始化数据	2026-06-17 00:21:30.344953	2026-06-17 00:21:30.344953	f	\N
查询	3	6	module_platform:menu:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	14	49	034c4a55-141e-47ca-867f-27c3f7b79dd5	0	初始化数据	2026-06-17 00:21:30.344957	2026-06-17 00:21:30.344957	f	\N
新增	3	1	module_system:tenant:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	15	50	ce279a24-9146-4858-92df-cae8b1c8c1a4	0	初始化数据	2026-06-17 00:21:30.34496	2026-06-17 00:21:30.34496	f	\N
编辑	3	2	module_system:tenant:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	platform	15	51	95f7cbcb-e769-4f3f-8aed-78d4fabac11d	0	初始化数据	2026-06-17 00:21:30.344963	2026-06-17 00:21:30.344963	f	\N
删除	3	3	module_system:tenant:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	15	52	7df5774a-be91-4b65-acec-f8bdba827337	0	初始化数据	2026-06-17 00:21:30.344966	2026-06-17 00:21:30.344967	f	\N
状态变更	3	4	module_system:tenant:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	platform	15	53	2a621a02-b127-452f-acf9-933616b136e2	0	初始化数据	2026-06-17 00:21:30.344969	2026-06-17 00:21:30.34497	f	\N
详情	3	5	module_system:tenant:query	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	platform	15	54	391a8650-9edf-412b-97f6-1d67202ceb87	0	初始化数据	2026-06-17 00:21:30.344973	2026-06-17 00:21:30.344973	f	\N
查询	3	6	module_system:tenant:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	15	55	e9848b82-f8e9-46b4-b1f6-d47973bc7277	0	初始化数据	2026-06-17 00:21:30.344976	2026-06-17 00:21:30.344976	f	\N
配置管理	3	11	module_system:tenant:update	\N	\N	\N	\N	\N	f	t	f	配置管理	null	f	pc	\N	f	f	\N	f	\N	platform	15	56	6891decd-40cd-4bc9-908a-b96142c365b6	0	初始化数据	2026-06-17 00:21:30.344979	2026-06-17 00:21:30.344979	f	\N
新增	3	1	module_package:package:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	16	57	35cb7b55-d2ef-49f1-aa98-5e17af465660	0	\N	2026-06-17 00:21:30.344982	2026-06-17 00:21:30.344982	f	\N
编辑	3	2	module_package:package:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	platform	16	58	2af5aea5-349f-46b1-953d-05beaddd7ac6	0	\N	2026-06-17 00:21:30.344985	2026-06-17 00:21:30.344986	f	\N
删除	3	3	module_package:package:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	16	59	58a70f60-fb4e-4f28-bd1b-2d8429a8ff06	0	\N	2026-06-17 00:21:30.344988	2026-06-17 00:21:30.344989	f	\N
查询	3	4	module_package:package:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	16	60	dbbf9d39-2290-4392-b196-ffe889de04e5	0	\N	2026-06-17 00:21:30.344991	2026-06-17 00:21:30.344992	f	\N
租户查询套餐	3	5	tenant:package:query	\N	\N	\N	\N	\N	t	t	f	租户查询套餐	null	f	pc	\N	f	f	\N	f	\N	platform	16	61	89886992-3663-4bd0-9662-ac91dfced1c5	0	\N	2026-06-17 00:21:30.344995	2026-06-17 00:21:30.344995	f	\N
发件配置	3	1	module_platform:email:update	\N	EmailConfig	\N	\N	\N	f	t	f	\N	\N	f	pc	\N	f	f	\N	f	\N	platform	17	62	eae3ba24-d721-4d77-b42c-c6d0c598eecb	0	\N	2026-06-17 00:21:30.347568	2026-06-17 00:21:30.347569	f	\N
邮件模板	3	2	module_platform:email:query	\N	EmailTemplate	\N	\N	\N	f	t	f	\N	\N	f	pc	\N	f	f	\N	f	\N	platform	17	63	292d278b-179d-4905-a0f5-7b3335ae921c	0	\N	2026-06-17 00:21:30.347573	2026-06-17 00:21:30.347573	f	\N
发送邮件	3	3	module_platform:email:update	\N	EmailSend	\N	\N	\N	f	t	f	\N	\N	f	pc	\N	f	f	\N	f	\N	platform	17	64	bf01b47c-2899-42be-bb2e-d6eb7e6cc1e0	0	\N	2026-06-17 00:21:30.347576	2026-06-17 00:21:30.347577	f	\N
发送日志	3	4	module_platform:email:query	\N	EmailLog	\N	\N	\N	f	t	f	\N	\N	f	pc	\N	f	f	\N	f	\N	platform	17	65	46326daa-b9ad-435c-82d1-b18a7229b669	0	\N	2026-06-17 00:21:30.34758	2026-06-17 00:21:30.34758	f	\N
查询	3	1	module_platform:order:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	18	66	ddfbb2e5-a371-454c-a09f-b6a1ee784616	0	初始化数据	2026-06-17 00:21:30.349735	2026-06-17 00:21:30.349737	f	\N
新增	3	2	module_platform:order:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	18	67	1f64305b-d398-4cc9-b623-aeaaa87aabba	0	初始化数据	2026-06-17 00:21:30.349741	2026-06-17 00:21:30.349741	f	\N
取消订单	3	3	module_platform:order:update	\N	\N	\N	\N	\N	f	t	f	取消订单	null	f	pc	\N	f	f	\N	f	\N	platform	18	68	a076bab6-983d-4fee-b254-8e32ae8e6bf7	0	初始化数据	2026-06-17 00:21:30.349745	2026-06-17 00:21:30.349745	f	\N
租户创建订单	3	4	tenant:order:create	\N	\N	\N	\N	\N	t	t	f	租户创建订单	null	f	pc	\N	f	f	\N	f	\N	platform	18	69	3868a937-8184-49cc-aa96-8e2c7571ead7	0	初始化数据	2026-06-17 00:21:30.349748	2026-06-17 00:21:30.349749	f	\N
租户查询订单	3	5	tenant:order:query	\N	\N	\N	\N	\N	t	t	f	租户查询订单	null	f	pc	\N	f	f	\N	f	\N	platform	18	70	0f531e79-c5fc-42aa-a729-9cfe35a30641	0	初始化数据	2026-06-17 00:21:30.349753	2026-06-17 00:21:30.349754	f	\N
租户申请退款	3	6	tenant:order:refund	\N	\N	\N	\N	\N	t	t	f	租户申请退款	null	f	pc	\N	f	f	\N	f	\N	platform	18	71	11b5d424-f089-4d9d-bfd3-055ba6847836	0	初始化数据	2026-06-17 00:21:30.349758	2026-06-17 00:21:30.349759	f	\N
查询	3	1	module_platform:invoice:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	19	72	3c905b6d-9f45-4b4c-a5f7-0f7d318a7cd0	0	初始化数据	2026-06-17 00:21:30.349763	2026-06-17 00:21:30.349763	f	\N
新增	3	2	module_platform:invoice:update	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	19	73	88d9c29b-2b04-4ad0-8a59-3565d2ca971f	0	初始化数据	2026-06-17 00:21:30.349767	2026-06-17 00:21:30.349767	f	\N
作废发票	3	3	module_platform:invoice:update	\N	\N	\N	\N	\N	f	t	f	作废发票	null	f	pc	\N	f	f	\N	f	\N	platform	19	74	43e26698-7940-44f6-8865-3bea15aacba4	0	初始化数据	2026-06-17 00:21:30.349771	2026-06-17 00:21:30.349771	f	\N
查询	3	1	module_platform:workspace:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	20	75	2d1307d9-019a-47e7-b035-4443e0962a9d	0	初始化数据	2026-06-17 00:21:30.349774	2026-06-17 00:21:30.349774	f	\N
查询	3	1	module_platform:plugin:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	21	76	55bca010-bd1d-4459-9bd1-a0a35445c814	0	初始化数据	2026-06-17 00:21:30.349777	2026-06-17 00:21:30.349778	f	\N
安装	3	2	module_platform:plugin:install	\N	\N	\N	\N	\N	f	t	f	安装	null	f	pc	\N	f	f	\N	f	\N	platform	21	77	ff1a7b95-20d4-4a89-b396-6ebcaae270c1	0	初始化数据	2026-06-17 00:21:30.349781	2026-06-17 00:21:30.349781	f	\N
卸载	3	3	module_platform:plugin:uninstall	\N	\N	\N	\N	\N	f	t	f	卸载	null	f	pc	\N	f	f	\N	f	\N	platform	21	78	a87ea2ab-9a09-4b9c-9776-da68cb2bbd32	0	初始化数据	2026-06-17 00:21:30.349784	2026-06-17 00:21:30.349784	f	\N
新增	3	4	module_platform:plugin:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	21	79	5e361784-b3d4-4398-a6ac-23861f7d3af6	0	初始化数据	2026-06-17 00:21:30.349787	2026-06-17 00:21:30.349788	f	\N
编辑	3	5	module_platform:plugin:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	platform	21	80	36cf3b78-1292-4724-a9f2-bb0d8148e080	0	初始化数据	2026-06-17 00:21:30.34979	2026-06-17 00:21:30.349791	f	\N
删除	3	6	module_platform:plugin:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	21	81	552eeb34-17b8-4ce7-800b-411cc354904c	0	初始化数据	2026-06-17 00:21:30.349794	2026-06-17 00:21:30.349794	f	\N
启用/禁用	3	7	module_platform:plugin:toggle	\N	\N	\N	\N	\N	f	t	f	启用/禁用	null	f	pc	\N	f	f	\N	f	\N	platform	21	82	075ce364-c57a-42e7-ac1b-b1cb0da32c52	0	初始化数据	2026-06-17 00:21:30.349797	2026-06-17 00:21:30.349797	f	\N
重新加载	3	8	module_platform:plugin:reload	\N	\N	\N	\N	\N	f	t	f	重新加载	null	f	pc	\N	f	f	\N	f	\N	platform	21	83	3e6d0c73-cd11-4a8c-8516-f68fd00b92fd	0	初始化数据	2026-06-17 00:21:30.3498	2026-06-17 00:21:30.349801	f	\N
新增	3	1	module_system:dict_type:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	22	84	86894dbc-0cff-4288-94c1-cf0495e68d56	0	初始化数据	2026-06-17 00:21:30.349804	2026-06-17 00:21:30.349804	f	\N
编辑	3	2	module_system:dict_type:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	22	85	3a4de76a-2726-4c24-84c9-87b914f7607f	0	初始化数据	2026-06-17 00:21:30.349807	2026-06-17 00:21:30.349807	f	\N
删除	3	3	module_system:dict_type:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	22	86	664d4d1b-46b8-46f5-86e5-ba059d8a9f88	0	初始化数据	2026-06-17 00:21:30.34981	2026-06-17 00:21:30.34981	f	\N
导出	3	4	module_system:dict_type:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	22	87	3108a9bf-6e4d-436e-b34c-3986f47a1903	0	初始化数据	2026-06-17 00:21:30.349813	2026-06-17 00:21:30.349813	f	\N
状态变更	3	5	module_system:dict_type:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	22	88	80dc4bde-c616-4551-8cde-91d0608b33b0	0	初始化数据	2026-06-17 00:21:30.349816	2026-06-17 00:21:30.349817	f	\N
查询	3	6	module_system:dict_data:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	22	89	49cd662b-93ff-493a-9d58-0ffc43dfa9e6	0	初始化数据	2026-06-17 00:21:30.349819	2026-06-17 00:21:30.34982	f	\N
新增	3	7	module_system:dict_data:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	22	90	6c79423b-fe3e-470f-bccf-db1399f290c6	0	初始化数据	2026-06-17 00:21:30.349823	2026-06-17 00:21:30.349823	f	\N
编辑	3	8	module_system:dict_data:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	22	91	06b9b385-2dc4-4d04-9740-eab041951668	0	初始化数据	2026-06-17 00:21:30.349826	2026-06-17 00:21:30.349826	f	\N
删除	3	9	module_system:dict_data:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	22	92	66dee608-bc6b-4b55-886c-d3dde3b193bf	0	初始化数据	2026-06-17 00:21:30.349829	2026-06-17 00:21:30.34983	f	\N
导出	3	10	module_system:dict_data:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	22	93	be784398-f56e-4730-8a4d-b85ec30fb11c	0	初始化数据	2026-06-17 00:21:30.349834	2026-06-17 00:21:30.349834	f	\N
状态变更	3	11	module_system:dict_data:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	22	94	0158ab0b-f0da-485d-8c40-dadaef6176fc	0	初始化数据	2026-06-17 00:21:30.349838	2026-06-17 00:21:30.349838	f	\N
详情	3	12	module_system:dict_type:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	22	95	f473ac95-f950-4c2f-bc12-3b9ed00fe11d	0	初始化数据	2026-06-17 00:21:30.349841	2026-06-17 00:21:30.349841	f	\N
查询	3	13	module_system:dict_type:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	22	96	54786cc9-d689-488d-8389-ecc824e2a775	0	初始化数据	2026-06-17 00:21:30.349844	2026-06-17 00:21:30.349845	f	\N
详情	3	14	module_system:dict_data:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	22	97	d2810cc2-b1eb-41e2-95b5-22091a353866	0	初始化数据	2026-06-17 00:21:30.349847	2026-06-17 00:21:30.349848	f	\N
新增	3	1	module_system:param:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	23	98	4abb3eb9-87e5-4123-ba47-c4e0acc00ee6	0	初始化数据	2026-06-17 00:21:30.349851	2026-06-17 00:21:30.349851	f	\N
编辑	3	2	module_system:param:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	23	99	facccf7a-5eae-4cbc-a76d-7cc5cb500ede	0	初始化数据	2026-06-17 00:21:30.349854	2026-06-17 00:21:30.349854	f	\N
删除	3	3	module_system:param:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	23	100	c0a6d825-f1e3-403f-aeda-7b31626775ac	0	初始化数据	2026-06-17 00:21:30.349857	2026-06-17 00:21:30.349857	f	\N
导出	3	4	module_system:param:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	23	101	65f7cb76-b4ad-4648-8b79-abe3510b864b	0	初始化数据	2026-06-17 00:21:30.34986	2026-06-17 00:21:30.349861	f	\N
参数上传	3	5	module_system:param:upload	\N	\N	\N	\N	\N	f	t	f	参数上传	null	f	pc	\N	f	f	\N	f	\N	tenant	23	102	a8e4e5e0-1a2e-471a-8342-8dccd665cdbc	0	初始化数据	2026-06-17 00:21:30.349864	2026-06-17 00:21:30.349864	f	\N
详情	3	6	module_system:param:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	23	103	e28c18f4-ae26-451b-8627-ca0527da9626	0	初始化数据	2026-06-17 00:21:30.349867	2026-06-17 00:21:30.349867	f	\N
查询	3	7	module_system:param:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	23	104	2a0918b1-37f9-4bf8-8c1d-9bcec8c7447f	0	初始化数据	2026-06-17 00:21:30.34987	2026-06-17 00:21:30.349871	f	\N
批量操作	3	8	module_system:param:patch	\N	\N	\N	\N	\N	f	t	f	批量操作	null	f	pc	\N	f	f	\N	f	\N	tenant	23	105	a9844579-7daa-4320-9da4-7b1163a28d1d	0	初始化数据	2026-06-17 00:21:30.349873	2026-06-17 00:21:30.349874	f	\N
新增	3	1	module_system:dept:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	24	106	ce6b8c52-17b5-4c95-bc75-d017788986dc	0	初始化数据	2026-06-17 00:21:30.349876	2026-06-17 00:21:30.349877	f	\N
编辑	3	2	module_system:dept:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	24	107	adf47aba-c55e-465d-81f6-6480da349613	0	初始化数据	2026-06-17 00:21:30.349879	2026-06-17 00:21:30.34988	f	\N
删除	3	3	module_system:dept:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	24	108	0e1e7d63-7d0d-4817-aad2-b585cedce601	0	初始化数据	2026-06-17 00:21:30.349882	2026-06-17 00:21:30.349883	f	\N
状态变更	3	4	module_system:dept:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	24	109	82d68620-36e1-4d07-b4db-9588f523fea7	0	初始化数据	2026-06-17 00:21:30.349885	2026-06-17 00:21:30.349886	f	\N
详情	3	5	module_system:dept:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	24	110	91b2fec4-ab9b-47c1-929d-a417ac0d878c	0	初始化数据	2026-06-17 00:21:30.349888	2026-06-17 00:21:30.349889	f	\N
查询	3	6	module_system:dept:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	24	111	5b52e6bc-8343-4c5e-b4be-a2387c053fb3	0	初始化数据	2026-06-17 00:21:30.349891	2026-06-17 00:21:30.349892	f	\N
新增	3	1	module_system:position:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	25	112	2b2505c8-e095-48bf-ae96-d693e6035079	0	初始化数据	2026-06-17 00:21:30.349895	2026-06-17 00:21:30.349895	f	\N
编辑	3	2	module_system:position:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	25	113	fa70ddad-7d01-4bec-8ceb-32baaf958c04	0	初始化数据	2026-06-17 00:21:30.349898	2026-06-17 00:21:30.349898	f	\N
删除	3	3	module_system:position:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	25	114	8ce51091-3467-4fe1-8192-e4c2d21ebf86	0	初始化数据	2026-06-17 00:21:30.349901	2026-06-17 00:21:30.349901	f	\N
状态变更	3	4	module_system:position:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	25	115	0020e8eb-b73c-4d20-aafa-90d892170733	0	初始化数据	2026-06-17 00:21:30.349904	2026-06-17 00:21:30.349904	f	\N
导出	3	5	module_system:position:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	25	116	70c74e2f-4973-41cf-b271-a6dae88fde51	0	初始化数据	2026-06-17 00:21:30.349907	2026-06-17 00:21:30.349908	f	\N
详情	3	6	module_system:position:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	25	117	b41ebee2-efb7-4a4d-84f8-6df1c0352a7f	0	初始化数据	2026-06-17 00:21:30.34991	2026-06-17 00:21:30.349911	f	\N
查询	3	7	module_system:position:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	25	118	bd1de2ac-de86-4d28-b9dc-522b124d9a32	0	初始化数据	2026-06-17 00:21:30.349913	2026-06-17 00:21:30.349914	f	\N
新增	3	1	module_system:role:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	26	119	5fd25982-f219-422a-ab0e-20c2e17552dd	0	初始化数据	2026-06-17 00:21:30.349916	2026-06-17 00:21:30.349917	f	\N
编辑	3	2	module_system:role:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	26	120	69d9e7ed-a06f-4ed9-8716-8a41f2467c71	0	初始化数据	2026-06-17 00:21:30.349919	2026-06-17 00:21:30.34992	f	\N
删除	3	3	module_system:role:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	26	121	22d13496-6e9f-4726-be24-a83737bb0892	0	初始化数据	2026-06-17 00:21:30.349922	2026-06-17 00:21:30.349923	f	\N
状态变更	3	4	module_system:role:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	26	122	609fe205-72fa-40b9-a367-ff1ddcd01e64	0	初始化数据	2026-06-17 00:21:30.349926	2026-06-17 00:21:30.349926	f	\N
导出	3	5	module_system:role:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	26	123	3c72c2d7-550d-4af4-b527-8b49c423a276	0	初始化数据	2026-06-17 00:21:30.349929	2026-06-17 00:21:30.349929	f	\N
详情	3	6	module_system:role:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	26	124	10ce062e-b8ec-4957-8f8c-b116a73cc3d1	0	初始化数据	2026-06-17 00:21:30.349932	2026-06-17 00:21:30.349932	f	\N
查询	3	7	module_system:role:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	26	125	2b436aa6-51d2-4ab0-a9ff-ee050641dba8	0	初始化数据	2026-06-17 00:21:30.349935	2026-06-17 00:21:30.349936	f	\N
分配权限	3	8	module_system:role:permission	\N	\N	\N	\N	\N	f	t	f	分配权限	null	f	pc	\N	f	f	\N	f	\N	tenant	26	126	7e7d534e-d80a-4628-9619-6470322d16e2	0	初始化数据	2026-06-17 00:21:30.349938	2026-06-17 00:21:30.349939	f	\N
新增	3	1	module_system:user:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	27	127	02b79891-dc25-4148-b8f6-573fce2dd306	0	初始化数据	2026-06-17 00:21:30.349942	2026-06-17 00:21:30.349942	f	\N
编辑	3	2	module_system:user:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	27	128	72ada588-9b18-4edb-b726-b0e5ead24426	0	初始化数据	2026-06-17 00:21:30.349945	2026-06-17 00:21:30.349945	f	\N
删除	3	3	module_system:user:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	27	129	a6d57b79-907a-4e80-8e0b-876609f00d4e	0	初始化数据	2026-06-17 00:21:30.349948	2026-06-17 00:21:30.349948	f	\N
状态变更	3	4	module_system:user:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	27	130	bce4adda-d702-49f1-9c3f-81d6c2c6fab4	0	初始化数据	2026-06-17 00:21:30.349951	2026-06-17 00:21:30.349951	f	\N
导出	3	5	module_system:user:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	27	131	213d2615-39bc-4642-8838-585cf9801cc6	0	初始化数据	2026-06-17 00:21:30.349954	2026-06-17 00:21:30.349955	f	\N
导入	3	6	module_system:user:import	\N	\N	\N	\N	\N	f	t	f	导入	null	f	pc	\N	f	f	\N	f	\N	tenant	27	132	73b67d89-fb49-4a7b-a69a-8f1ca4be83d6	0	初始化数据	2026-06-17 00:21:30.349957	2026-06-17 00:21:30.349958	f	\N
下载导入模板	3	7	module_system:user:download	\N	\N	\N	\N	\N	f	t	f	下载导入模板	null	f	pc	\N	f	f	\N	f	\N	tenant	27	133	de18fe20-a9a2-4b0f-9236-0a82e3db46e1	0	初始化数据	2026-06-17 00:21:30.34996	2026-06-17 00:21:30.349961	f	\N
详情	3	8	module_system:user:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	27	134	e2d090cd-50be-4acc-af2d-10d598e38f0c	0	初始化数据	2026-06-17 00:21:30.349964	2026-06-17 00:21:30.349964	f	\N
查询	3	9	module_system:user:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	27	135	d91420de-c397-4802-a8b7-d1a5840a0d1c	0	初始化数据	2026-06-17 00:21:30.349967	2026-06-17 00:21:30.349967	f	\N
删除	3	1	module_system:log:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	28	136	26835e69-e515-4c87-bd79-0a11d0ec6dfd	0	初始化数据	2026-06-17 00:21:30.34997	2026-06-17 00:21:30.34997	f	\N
导出	3	2	module_system:log:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	28	137	11b05919-8d96-433c-a5b6-d30af7ce0097	0	初始化数据	2026-06-17 00:21:30.349973	2026-06-17 00:21:30.349973	f	\N
详情	3	3	module_system:log:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	28	138	fca5a4b5-94cc-4494-b377-fcf442b0f0a2	0	初始化数据	2026-06-17 00:21:30.349976	2026-06-17 00:21:30.349976	f	\N
查询	3	4	module_system:log:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	28	139	b07921ca-0d8c-4f7d-89fd-462a69bf4720	0	初始化数据	2026-06-17 00:21:30.349979	2026-06-17 00:21:30.349979	f	\N
登录日志删除	3	5	module_system:login_log:delete	\N	\N	\N	\N	\N	f	t	f	登录日志删除	null	f	pc	\N	f	f	\N	f	\N	tenant	28	140	af68b8b3-9cf0-4c2f-af5d-34b20715fa0b	0	初始化数据	2026-06-17 00:21:30.349982	2026-06-17 00:21:30.349982	f	\N
登录日志查询	3	6	module_system:login_log:query	\N	\N	\N	\N	\N	f	t	f	登录日志查询	null	f	pc	\N	f	f	\N	f	\N	tenant	28	141	d0e0b01e-16dd-4951-87dd-0e9b6dbad28d	0	初始化数据	2026-06-17 00:21:30.349985	2026-06-17 00:21:30.349986	f	\N
新增	3	1	module_system:notice:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	29	142	15e44658-7af4-446f-b140-1b6863092f74	0	初始化数据	2026-06-17 00:21:30.349988	2026-06-17 00:21:30.349989	f	\N
编辑	3	2	module_system:notice:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	29	143	6a6acd4b-ccaf-4c21-b9b4-f260c9eee400	0	初始化数据	2026-06-17 00:21:30.349991	2026-06-17 00:21:30.349992	f	\N
删除	3	3	module_system:notice:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	29	144	5f44da02-1c71-4d78-a163-baa571593f2c	0	初始化数据	2026-06-17 00:21:30.349994	2026-06-17 00:21:30.349995	f	\N
导出	3	4	module_system:notice:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	29	145	34e131cc-4cdd-4c3a-a608-03bdc979e607	0	初始化数据	2026-06-17 00:21:30.349997	2026-06-17 00:21:30.349998	f	\N
状态变更	3	5	module_system:notice:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	29	146	7ac0c563-d973-49a5-bb63-b43f65083e73	0	初始化数据	2026-06-17 00:21:30.350001	2026-06-17 00:21:30.350001	f	\N
详情	3	6	module_system:notice:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	29	147	79ef8ca1-e694-4199-8be6-5ad8c48a972e	0	初始化数据	2026-06-17 00:21:30.350004	2026-06-17 00:21:30.350004	f	\N
查询	3	5	module_system:notice:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	29	148	2f216bf9-ba4c-40b6-87a5-885e17f40afe	0	初始化数据	2026-06-17 00:21:30.350007	2026-06-17 00:21:30.350007	f	\N
查询	3	1	module_system:ticket:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	30	149	d7d7087a-1da5-4de8-a919-e6328cf425f4	0	初始化数据	2026-06-17 00:21:30.35001	2026-06-17 00:21:30.35001	f	\N
新增	3	2	module_system:ticket:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	30	150	894f248d-b245-4ef2-941c-6e1a9107e9cf	0	初始化数据	2026-06-17 00:21:30.350013	2026-06-17 00:21:30.350013	f	\N
编辑	3	3	module_system:ticket:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	30	151	b1d45db7-13c5-46cc-a3cf-ae7512a44193	0	初始化数据	2026-06-17 00:21:30.350016	2026-06-17 00:21:30.350017	f	\N
删除	3	4	module_system:ticket:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	30	152	8980fdcc-7592-46c5-a9e1-07deb9279670	0	初始化数据	2026-06-17 00:21:30.350019	2026-06-17 00:21:30.35002	f	\N
详情	3	5	module_system:ticket:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	30	153	662bfef5-b36d-4173-baea-af81f08c33f8	0	初始化数据	2026-06-17 00:21:30.350022	2026-06-17 00:21:30.350023	f	\N
导出	3	6	module_system:ticket:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	30	154	be99d09b-03e0-40bd-b1b4-453eacfb49c3	0	初始化数据	2026-06-17 00:21:30.350026	2026-06-17 00:21:30.350026	f	\N
批量操作	3	7	module_system:ticket:patch	\N	\N	\N	\N	\N	f	t	f	批量操作	null	f	pc	\N	f	f	\N	f	\N	tenant	30	155	35ef550d-3717-472d-8d1c-403eb289ea7a	0	初始化数据	2026-06-17 00:21:30.350029	2026-06-17 00:21:30.350029	f	\N
强制下线	3	1	module_monitor:online:delete	\N	\N	\N	\N	\N	f	t	f	强制下线	null	f	pc	\N	f	f	\N	f	\N	platform	32	156	897e67af-703b-43ce-8e78-789925ee1669	0	初始化数据	2026-06-17 00:21:30.350032	2026-06-17 00:21:30.350032	f	\N
清除缓存	3	1	module_monitor:cache:delete	\N	\N	\N	\N	\N	f	t	f	清除缓存	null	f	pc	\N	f	f	\N	f	\N	platform	34	157	14549f25-be04-4bad-8a1b-e00f105c18ac	0	初始化数据	2026-06-17 00:21:30.350035	2026-06-17 00:21:30.350035	f	\N
详情	3	2	module_monitor:cache:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	platform	34	158	7bbf6825-b4d5-4dc1-9503-5b93a3447976	0	初始化数据	2026-06-17 00:21:30.350038	2026-06-17 00:21:30.350038	f	\N
上传	3	1	module_monitor:resource:upload	\N	\N	\N	\N	\N	f	t	f	上传	null	f	pc	\N	f	f	\N	f	\N	platform	35	159	ac104d07-365b-4eb0-a99f-be82268d7fe5	0	初始化数据	2026-06-17 00:21:30.350041	2026-06-17 00:21:30.350042	f	\N
下载	3	2	module_monitor:resource:download	\N	\N	\N	\N	\N	f	t	f	下载	null	f	pc	\N	f	f	\N	f	\N	platform	35	160	b99e0b42-5e1e-47d7-bdc4-5a9bfc273526	0	初始化数据	2026-06-17 00:21:30.350044	2026-06-17 00:21:30.350045	f	\N
删除	3	3	module_monitor:resource:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	35	161	0dfcb6cc-8258-40e2-9b06-7c7aacff3c07	0	初始化数据	2026-06-17 00:21:30.350047	2026-06-17 00:21:30.350048	f	\N
移动	3	4	module_monitor:resource:move	\N	\N	\N	\N	\N	f	t	f	移动	null	f	pc	\N	f	f	\N	f	\N	platform	35	162	cf1d07e4-a6dc-44cc-82d2-377a8c9f9391	0	初始化数据	2026-06-17 00:21:30.35005	2026-06-17 00:21:30.350051	f	\N
复制	3	5	module_monitor:resource:copy	\N	\N	\N	\N	\N	f	t	f	复制	null	f	pc	\N	f	f	\N	f	\N	platform	35	163	eafba826-dc99-4e57-9365-7ba594ad8973	0	初始化数据	2026-06-17 00:21:30.350053	2026-06-17 00:21:30.350054	f	\N
重命名	3	6	module_monitor:resource:rename	\N	\N	\N	\N	\N	f	t	f	重命名	null	f	pc	\N	f	f	\N	f	\N	platform	35	164	b621601f-e691-4037-bade-b8097e78ea70	0	初始化数据	2026-06-17 00:21:30.350056	2026-06-17 00:21:30.350057	f	\N
新增	3	7	module_monitor:resource:create_dir	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	35	165	c5409ef9-4e09-476e-a255-47d8d00ed6d3	0	初始化数据	2026-06-17 00:21:30.35006	2026-06-17 00:21:30.35006	f	\N
导出	3	9	module_monitor:resource:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	platform	35	166	475ce758-f604-4ade-907b-5ea663741525	0	初始化数据	2026-06-17 00:21:30.350063	2026-06-17 00:21:30.350063	f	\N
查询	3	1	module_generator:gencode:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	38	167	94770742-f79f-4410-864b-060a232dc5d4	0	查询代码生成业务表列表	2026-06-17 00:21:30.350066	2026-06-17 00:21:30.350066	f	\N
新增	3	2	module_generator:gencode:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	38	168	e5d33ea6-84f8-43a2-9528-e49eaf8b24b7	0	创建表结构	2026-06-17 00:21:30.350069	2026-06-17 00:21:30.350069	f	\N
编辑	3	3	module_generator:gencode:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	platform	38	169	df3f3b78-fa02-4458-a9ac-ffb247c13387	0	编辑业务表信息	2026-06-17 00:21:30.350072	2026-06-17 00:21:30.350072	f	\N
删除	3	4	module_generator:gencode:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	38	170	8d657137-e268-4deb-93e8-d683f1cbeda1	0	删除业务表信息	2026-06-17 00:21:30.350075	2026-06-17 00:21:30.350076	f	\N
导入	3	5	module_generator:gencode:import	\N	\N	\N	\N	\N	f	t	f	导入	null	f	pc	\N	f	f	\N	f	\N	platform	38	171	6442e934-bd42-4432-8183-1538902ee447	0	导入表结构	2026-06-17 00:21:30.350078	2026-06-17 00:21:30.350079	f	\N
批量生成代码	3	6	module_generator:gencode:operate	\N	\N	\N	\N	\N	f	t	f	批量生成代码	null	f	pc	\N	f	f	\N	f	\N	platform	38	172	b93b35f5-8478-481b-b1fd-1f447198940a	0	批量生成代码	2026-06-17 00:21:30.350081	2026-06-17 00:21:30.350082	f	\N
生成代码到指定路径	3	7	module_generator:gencode:code	\N	\N	\N	\N	\N	f	t	f	生成代码到指定路径	null	f	pc	\N	f	f	\N	f	\N	platform	38	173	ef3da9fe-cdfd-4c18-adda-e89d1fad9ac6	0	生成代码到指定路径	2026-06-17 00:21:30.350084	2026-06-17 00:21:30.350085	f	\N
查询	3	8	module_generator:dblist:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	38	174	4bf17d1a-5d1a-43f6-8292-28da6883ef57	0	查询数据库表列表	2026-06-17 00:21:30.350087	2026-06-17 00:21:30.350088	f	\N
同步数据库	3	9	module_generator:db:sync	\N	\N	\N	\N	\N	f	t	f	同步数据库	null	f	pc	\N	f	f	\N	f	\N	platform	38	175	85fe694d-7b86-45dc-8a61-c7bb941c889a	0	同步数据库	2026-06-17 00:21:30.35009	2026-06-17 00:21:30.350091	f	\N
AI对话	3	1	module_ai:chat:ws	\N	\N	\N	\N	\N	f	t	f	AI对话	null	f	pc	\N	f	f	\N	f	\N	platform	39	176	81b6f983-7067-4463-87c5-1e4ca590f144	0	AI对话	2026-06-17 00:21:30.350093	2026-06-17 00:21:30.350094	f	\N
查询	3	2	module_ai:chat:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	39	177	da5cdad3-f395-4a67-8eec-4dfd289bb97d	0	查询会话	2026-06-17 00:21:30.350097	2026-06-17 00:21:30.350097	f	\N
详情	3	3	module_ai:chat:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	platform	39	178	e40f7ee4-6a8d-4914-811b-4ebb634fcfc4	0	会话详情	2026-06-17 00:21:30.3501	2026-06-17 00:21:30.3501	f	\N
新增	3	4	module_ai:chat:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	platform	39	179	66d6dd56-44d6-4591-8adf-0dd4ab774c0c	0	创建会话	2026-06-17 00:21:30.350103	2026-06-17 00:21:30.350103	f	\N
编辑	3	5	module_ai:chat:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	platform	39	180	8a9428ea-ffa2-442e-b276-4de59a42c339	0	更新会话	2026-06-17 00:21:30.350106	2026-06-17 00:21:30.350106	f	\N
删除	3	6	module_ai:chat:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	39	181	52fbfd44-00e2-428b-b0e7-8edf63ad8d46	0	删除会话	2026-06-17 00:21:30.350109	2026-06-17 00:21:30.350109	f	\N
查询	3	1	module_ai:chat:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	platform	40	182	24579e9f-cb74-47db-9281-a67e58cb5f5d	0	查询会话记忆	2026-06-17 00:21:30.350112	2026-06-17 00:21:30.350112	f	\N
详情	3	2	module_ai:chat:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	platform	40	183	3bf03f0d-9618-4aaf-92b0-ca375ad6f46d	0	会话记忆详情	2026-06-17 00:21:30.350115	2026-06-17 00:21:30.350115	f	\N
删除	3	3	module_ai:chat:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	platform	40	184	d79691cb-4c3e-4dfe-b2b3-f052cb0c72df	0	删除会话记忆	2026-06-17 00:21:30.350118	2026-06-17 00:21:30.350119	f	\N
调度器监控	2	1	module_task:cronjob:job:query	ri:line-chart-line	Job	job	module_task/cronjob/job/index	\N	f	t	f	调度器监控	null	f	pc	\N	f	f	\N	f	\N	platform	41	185	88d2231c-0958-44b9-9c3a-04675560df68	0	调度器监控	2026-06-17 00:21:30.350121	2026-06-17 00:21:30.350122	f	\N
节点管理	2	2	module_task:cronjob:node:query	ri:mail-send-line	Node	node	module_task/cronjob/node/index	\N	f	t	f	节点管理	null	f	pc	\N	f	f	\N	f	\N	platform	41	186	805b00f3-41ea-4fe4-aee2-b8cf40b69ba1	0	节点管理	2026-06-17 00:21:30.350125	2026-06-17 00:21:30.350125	f	\N
流程编排	2	1	module_task:workflow:definition:query	ri:tools-line	Workflow	task/workflow/definition	module_task/workflow/definition/index	\N	f	t	f	流程编排	null	f	pc	\N	f	f	\N	f	\N	platform	42	187	bee51bf1-2ae1-4404-bd25-a76affc2fecb	0	Vue Flow 画布与发布执行	2026-06-17 00:21:30.350128	2026-06-17 00:21:30.350128	f	\N
编排节点类型	2	2	module_task:workflow:node-type:query	ri:layout-grid-line	WorkflowNodeType	task/workflow/node-type	module_task/workflow/node-type/index	\N	f	t	f	编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	42	188	f19a8032-d753-40b5-9c38-5a51fcbf8446	0	画布节点类型与 Prefect 执行逻辑	2026-06-17 00:21:30.350131	2026-06-17 00:21:30.350131	f	\N
demo示例	2	1	module_example:demo:query	ri:menu-line	Demo	demo	module_example/demo/index	\N	f	t	f	demo示例	null	f	pc	\N	f	f	\N	f	\N	tenant	43	189	c74f8307-a6c4-4f0b-bb21-f9c03939a8a9	0	demo示例	2026-06-17 00:21:30.350134	2026-06-17 00:21:30.350134	f	\N
查询调度器	3	1	module_task:cronjob:job:query	\N	\N	\N	\N	\N	f	t	f	查询调度器	null	f	pc	\N	f	f	\N	f	\N	platform	185	190	d68c74b2-e204-4a67-a928-425f7f3f6037	0	查询调度器	2026-06-17 00:21:30.358456	2026-06-17 00:21:30.358457	f	\N
控制调度器	3	2	module_task:cronjob:job:scheduler	\N	\N	\N	\N	\N	f	t	f	控制调度器	null	f	pc	\N	f	f	\N	f	\N	platform	185	191	75135e01-5e5a-4e22-b16c-a8e8f49c3728	0	控制调度器	2026-06-17 00:21:30.358461	2026-06-17 00:21:30.358462	f	\N
操作任务	3	3	module_task:cronjob:job:task	\N	\N	\N	\N	\N	f	t	f	操作任务	null	f	pc	\N	f	f	\N	f	\N	platform	185	192	d77a4bad-10e9-46ed-bd14-b11a08984888	0	操作任务	2026-06-17 00:21:30.358465	2026-06-17 00:21:30.358465	f	\N
删除执行日志	3	4	module_task:cronjob:job:delete	\N	\N	\N	\N	\N	f	t	f	删除执行日志	null	f	pc	\N	f	f	\N	f	\N	platform	185	193	fdf7f643-42bb-4de8-8000-2f6b3b3abc65	0	删除执行日志	2026-06-17 00:21:30.358468	2026-06-17 00:21:30.358468	f	\N
详情执行日志	3	5	module_task:cronjob:job:detail	\N	\N	\N	\N	\N	f	t	f	详情执行日志	null	f	pc	\N	f	f	\N	f	\N	platform	185	194	b8e9c80d-1639-46a5-9fd1-ec3faacd78f2	0	详情执行日志	2026-06-17 00:21:30.358471	2026-06-17 00:21:30.358472	f	\N
创建节点	3	1	module_task:cronjob:node:create	\N	\N	\N	\N	\N	f	t	f	创建节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	195	7f0329b0-2aca-4ab6-ba4c-d67471135772	0	创建节点	2026-06-17 00:21:30.358474	2026-06-17 00:21:30.358475	f	\N
调试节点	3	2	module_task:cronjob:node:execute	\N	\N	\N	\N	\N	f	t	f	调试节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	196	ac0d6c20-010d-4918-9b1b-a5b5685281f4	0	调试节点	2026-06-17 00:21:30.358477	2026-06-17 00:21:30.358478	f	\N
修改节点	3	3	module_task:cronjob:node:update	\N	\N	\N	\N	\N	f	t	f	修改节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	197	329a9515-b774-4fa0-b531-efd376003e10	0	修改节点	2026-06-17 00:21:30.35848	2026-06-17 00:21:30.358481	f	\N
删除节点	3	4	module_task:cronjob:node:delete	\N	\N	\N	\N	\N	f	t	f	删除节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	198	50b8f8ce-9ae3-4550-bd1c-ecf6a2a5fb2e	0	删除节点	2026-06-17 00:21:30.358484	2026-06-17 00:21:30.358484	f	\N
详情节点	3	5	module_task:cronjob:node:detail	\N	\N	\N	\N	\N	f	t	f	详情节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	199	73d9ac9d-7cf0-444e-bb66-e0ac08e3e9e0	0	详情节点	2026-06-17 00:21:30.358487	2026-06-17 00:21:30.358487	f	\N
查询节点	3	6	module_task:cronjob:node:query	\N	\N	\N	\N	\N	f	t	f	查询节点	null	f	pc	\N	f	f	\N	f	\N	platform	186	200	ece1e8a5-bae8-4ceb-b9ec-4b592eed4dc7	0	查询节点	2026-06-17 00:21:30.35849	2026-06-17 00:21:30.35849	f	\N
创建流程	3	1	module_task:workflow:definition:create	\N	\N	\N	\N	\N	f	t	f	创建流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	201	b69b05f0-0db8-47b6-9026-4a739f600088	0	创建流程	2026-06-17 00:21:30.358493	2026-06-17 00:21:30.358493	f	\N
执行流程	3	2	module_task:workflow:definition:execute	\N	\N	\N	\N	\N	f	t	f	执行流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	202	438bb601-5389-4705-a71c-b203a5ad4454	0	执行流程	2026-06-17 00:21:30.358496	2026-06-17 00:21:30.358496	f	\N
修改流程	3	3	module_task:workflow:definition:update	\N	\N	\N	\N	\N	f	t	f	修改流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	203	95c10a23-5ee5-46a7-9109-f7ed7c2ce71c	0	修改流程	2026-06-17 00:21:30.358499	2026-06-17 00:21:30.358499	f	\N
删除流程	3	4	module_task:workflow:definition:delete	\N	\N	\N	\N	\N	f	t	f	删除流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	204	aee04a61-0d2d-4c0c-9d43-c953c41b2808	0	删除流程	2026-06-17 00:21:30.358502	2026-06-17 00:21:30.358502	f	\N
详情流程	3	5	module_task:workflow:definition:detail	\N	\N	\N	\N	\N	f	t	f	详情流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	205	22efea26-bf5c-4b44-b38f-8bc56b93cd00	0	详情流程	2026-06-17 00:21:30.358505	2026-06-17 00:21:30.358505	f	\N
查询流程	3	6	module_task:workflow:definition:query	\N	\N	\N	\N	\N	f	t	f	查询流程	null	f	pc	\N	f	f	\N	f	\N	platform	187	206	0d0fd864-1433-42ef-962d-ff371425e500	0	查询流程	2026-06-17 00:21:30.358508	2026-06-17 00:21:30.358509	f	\N
创建编排节点类型	3	1	module_task:workflow:node-type:create	\N	\N	\N	\N	\N	f	t	f	创建编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	188	207	8591053d-31b6-441c-aefd-e8817cb68d3f	0	创建编排节点类型	2026-06-17 00:21:30.358511	2026-06-17 00:21:30.358512	f	\N
修改编排节点类型	3	2	module_task:workflow:node-type:update	\N	\N	\N	\N	\N	f	t	f	修改编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	188	208	33c8e34d-218e-42fe-b95a-0278dd8ac5cd	0	修改编排节点类型	2026-06-17 00:21:30.358514	2026-06-17 00:21:30.358515	f	\N
删除编排节点类型	3	3	module_task:workflow:node-type:delete	\N	\N	\N	\N	\N	f	t	f	删除编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	188	209	c35c4378-3406-4ece-bfba-6fc08fbac12a	0	删除编排节点类型	2026-06-17 00:21:30.358517	2026-06-17 00:21:30.358518	f	\N
详情编排节点类型	3	4	module_task:workflow:node-type:detail	\N	\N	\N	\N	\N	f	t	f	详情编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	188	210	4d9a9551-565e-4d44-8c98-161d8f080a42	0	详情编排节点类型	2026-06-17 00:21:30.35852	2026-06-17 00:21:30.358521	f	\N
查询编排节点类型	3	5	module_task:workflow:node-type:query	\N	\N	\N	\N	\N	f	t	f	查询编排节点类型	null	f	pc	\N	f	f	\N	f	\N	platform	188	211	a2b67634-7edf-4a8d-9bda-21f6d29a547e	0	查询编排节点类型	2026-06-17 00:21:30.358523	2026-06-17 00:21:30.358524	f	\N
新增	3	1	module_example:demo:create	\N	\N	\N	\N	\N	f	t	f	新增	null	f	pc	\N	f	f	\N	f	\N	tenant	189	212	c65e7c7c-773a-4377-98b9-83a3255d5249	0	初始化数据	2026-06-17 00:21:30.358526	2026-06-17 00:21:30.358527	f	\N
编辑	3	2	module_example:demo:update	\N	\N	\N	\N	\N	f	t	f	编辑	null	f	pc	\N	f	f	\N	f	\N	tenant	189	213	63967e75-11c0-4278-9fb9-6cb73f828fde	0	初始化数据	2026-06-17 00:21:30.35853	2026-06-17 00:21:30.35853	f	\N
删除	3	3	module_example:demo:delete	\N	\N	\N	\N	\N	f	t	f	删除	null	f	pc	\N	f	f	\N	f	\N	tenant	189	214	2b2200ad-60c0-4477-9ee9-a3e9067d9bad	0	初始化数据	2026-06-17 00:21:30.358533	2026-06-17 00:21:30.358533	f	\N
状态变更	3	4	module_example:demo:patch	\N	\N	\N	\N	\N	f	t	f	状态变更	null	f	pc	\N	f	f	\N	f	\N	tenant	189	215	a55a1098-3051-4c21-8eb2-8db8ebd12306	0	初始化数据	2026-06-17 00:21:30.358536	2026-06-17 00:21:30.358536	f	\N
导出	3	5	module_example:demo:export	\N	\N	\N	\N	\N	f	t	f	导出	null	f	pc	\N	f	f	\N	f	\N	tenant	189	216	0936070a-a5b5-4db3-81e4-742e6f919ef0	0	初始化数据	2026-06-17 00:21:30.358539	2026-06-17 00:21:30.358539	f	\N
导入	3	6	module_example:demo:import	\N	\N	\N	\N	\N	f	t	f	导入	null	f	pc	\N	f	f	\N	f	\N	tenant	189	217	e2614b6d-b7f3-4ccd-a608-4ad6ded031a9	0	初始化数据	2026-06-17 00:21:30.358542	2026-06-17 00:21:30.358542	f	\N
下载导入模板	3	7	module_example:demo:download	\N	\N	\N	\N	\N	f	t	f	下载导入模板	null	f	pc	\N	f	f	\N	f	\N	tenant	189	218	48754c1b-d35e-4a80-8fe7-e608abd36a69	0	初始化数据	2026-06-17 00:21:30.358545	2026-06-17 00:21:30.358545	f	\N
详情	3	8	module_example:demo:detail	\N	\N	\N	\N	\N	f	t	f	详情	null	f	pc	\N	f	f	\N	f	\N	tenant	189	219	b911d90f-de57-4fbd-a1e8-1eb1b009430a	0	初始化数据	2026-06-17 00:21:30.358548	2026-06-17 00:21:30.358548	f	\N
查询	3	9	module_example:demo:query	\N	\N	\N	\N	\N	f	t	f	查询	null	f	pc	\N	f	f	\N	f	\N	tenant	189	220	97788885-5a2a-48f3-a0d3-15d94ad71ed0	0	初始化数据	2026-06-17 00:21:30.358551	2026-06-17 00:21:30.358552	f	\N
\.


--
-- Data for Name: platform_order; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_order (order_no, package_id, plugin_id, order_type, amount, period_count, pay_method, pay_time, expire_time, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
202601010000001	2	\N	new	29900	12	alipay	2026-01-01 10:30:00	2026-01-01 10:45:00	1	8e4e58a8-ba53-4442-a273-fdd4f8b56a24	1	星辰科技-标准版年付新购	2026-06-17 00:21:30.40931	2026-06-17 00:21:30.409311	f	\N	3
202603150000001	\N	2	plugin	9900	1	wxpay	2026-03-15 14:20:00	2026-03-15 14:35:00	2	9668f702-3823-4780-bea5-e34394e99eb1	1	星辰科技-AI助手插件购买	2026-06-17 00:21:30.409315	2026-06-17 00:21:30.409315	f	\N	3
202604010000001	4	\N	upgrade	269900	12	alipay	2026-04-01 09:00:00	2026-04-01 09:15:00	3	53dfc2eb-3507-4324-af1d-56ee6d7bfe61	1	星辰科技-标准版升级为企业版	2026-06-17 00:21:30.409318	2026-06-17 00:21:30.409319	f	\N	3
202602010000001	3	\N	new	99900	6	wxpay	2026-02-01 11:00:00	2026-02-01 11:15:00	4	d5591077-a696-4be0-b8da-43d1e603ef8f	3	创新工坊-专业版半年（已退款）	2026-06-17 00:21:30.409322	2026-06-17 00:21:30.409322	f	\N	4
202605150000001	\N	4	plugin	19900	1	\N	\N	2026-05-15 16:45:00	5	9f880dbc-8ed2-4fee-95ee-82ce19349344	2	创新工坊-工作流引擎（已取消）	2026-06-17 00:21:30.409325	2026-06-17 00:21:30.409326	f	\N	4
202606010000001	2	\N	new	29900	1	alipay	2026-06-01 08:30:00	2026-06-01 08:45:00	6	5862f4a3-1080-42ac-9d91-0294dd5e458f	1	创新工坊-标准版月付新购	2026-06-17 00:21:30.409329	2026-06-17 00:21:30.409329	f	\N	4
202606100000001	\N	5	plugin	4900	1	wxpay	2026-06-10 15:00:00	2026-06-10 15:15:00	7	d5e1e888-d099-4e25-a6aa-8ad0113c76e5	1	创新工坊-数据大屏插件购买	2026-06-17 00:21:30.409332	2026-06-17 00:21:30.409332	f	\N	4
202606120000001	2	\N	renew	269100	12	alipay	2026-06-12 10:00:00	2026-06-12 10:15:00	8	18758976-2452-46ec-ac26-8e7e2e9e9c64	1	星辰科技-企业版年付续费	2026-06-17 00:21:30.409335	2026-06-17 00:21:30.409336	f	\N	3
202606120000002	\N	\N	new	0	0	\N	\N	2026-06-13 00:00:00	9	66cfb3dd-1ff7-4292-8beb-e9996cd1668e	0	平台租户-测试待支付订单	2026-06-17 00:21:30.409339	2026-06-17 00:21:30.409339	f	\N	1
\.


--
-- Data for Name: platform_package; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_package (name, code, sort, price, period, trial_days, max_users, max_roles, max_depts, max_storage_mb, rate_limit, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
基础版	basic	1	0	month	7	10	5	10	1024	30	1	815ed234-2867-4277-9eba-6451519f5a6a	0	适合个人和小团队使用	2026-06-17 00:21:30.307862	2026-06-17 00:21:30.307865	f	\N
标准版	standard	2	29900	month	0	50	20	50	10240	60	2	d7834039-aa1e-4e8c-accf-fc6260d6a5bf	0	适合成长型企业	2026-06-17 00:21:30.30787	2026-06-17 00:21:30.30787	f	\N
专业版	pro	3	99900	month	0	200	50	200	102400	120	3	21701a5e-23a2-4486-bf8b-a7279e0fa7f8	0	适合中型企业	2026-06-17 00:21:30.307873	2026-06-17 00:21:30.307874	f	\N
企业版	enterprise	4	299900	year	0	1000	200	1000	1024000	300	4	9de43c63-517c-4c57-b199-94fef6f1a040	0	适合大型企业和组织	2026-06-17 00:21:30.307877	2026-06-17 00:21:30.307877	f	\N
\.


--
-- Data for Name: platform_package_menu; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_package_menu (id, package_id, menu_id) FROM stdin;
1	1	7
2	1	8
3	1	9
4	1	10
5	2	2
6	2	5
7	2	6
8	2	7
9	2	8
10	2	9
11	2	10
12	3	1
13	3	2
14	3	3
15	3	5
16	3	6
17	3	7
18	3	8
19	3	9
20	3	10
21	4	1
22	4	2
23	4	3
24	4	4
25	4	5
26	4	6
27	4	7
28	4	8
29	4	9
30	4	10
\.


--
-- Data for Name: platform_package_plugin; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_package_plugin (id, package_id, plugin_id) FROM stdin;
\.


--
-- Data for Name: platform_payment_record; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_payment_record (order_id, transaction_id, pay_method, amount, raw_response, pay_time, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
1	ALIP20260101000001	alipay	29900	\N	2026-01-01 10:30:00	1	0192b661-77aa-40a0-865b-baa08bfbe5fe	1	星辰科技-标准版年付	2026-06-17 00:21:30.419963	2026-06-17 00:21:30.419965	f	\N	3
2	WXPAY202603150001	wxpay	9900	\N	2026-03-15 14:20:00	2	8c089da8-22c9-4591-8825-2175786bd5b7	1	星辰科技-AI助手	2026-06-17 00:21:30.419969	2026-06-17 00:21:30.419969	f	\N	3
3	ALIP20260401000001	alipay	269900	\N	2026-04-01 09:00:00	3	4bcb4d36-9311-48ba-8577-af3619fa7a54	1	星辰科技-升级企业版	2026-06-17 00:21:30.419973	2026-06-17 00:21:30.419973	f	\N	3
4	WXPAY202602010001	wxpay	99900	\N	2026-02-01 11:00:00	4	410e100c-a2e7-47c1-9496-58aff3589480	2	创新工坊-专业版半年（已退款）	2026-06-17 00:21:30.419976	2026-06-17 00:21:30.419977	f	\N	4
6	ALIP20260601000001	alipay	29900	\N	2026-06-01 08:30:00	5	7b68cdfc-b473-403c-a3bd-cfc54c4ebcda	1	创新工坊-标准版月付	2026-06-17 00:21:30.419979	2026-06-17 00:21:30.41998	f	\N	4
7	WXPAY202606100001	wxpay	4900	\N	2026-06-10 15:00:00	6	66b31e90-93a0-48a6-b4da-f9dc798b21ea	1	创新工坊-数据大屏	2026-06-17 00:21:30.419983	2026-06-17 00:21:30.419983	f	\N	4
8	ALIP20260612000001	alipay	269100	\N	2026-06-12 10:00:00	7	5d22c876-658d-47c3-85fd-423e42ccd662	1	星辰科技-企业版续费	2026-06-17 00:21:30.419986	2026-06-17 00:21:30.419986	f	\N	3
\.


--
-- Data for Name: platform_plugin; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_plugin (name, code, version, author, icon, category, price, menu_path, permission_prefix, dependencies, sort, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
代码生成器	code_generator	1.0.0	FastApiAdmin	https://service.fastapiadmin.com/api/v1/static/image/plugin/code.png	tool	0	/tool/generator	tool:generator	\N	1	1	e6a10f25-16f9-4fa9-ae1a-c7d621070401	0	自动生成CRUD代码，支持多种模板	2026-06-17 00:21:30.319303	2026-06-17 00:21:30.319306	f	\N
AI助手	ai_assistant	1.0.0	FastApiAdmin	https://service.fastapiadmin.com/api/v1/static/image/plugin/ai.png	ai	9900	/ai/assistant	ai:assistant	\N	2	2	bc0da70b-2ff7-4dd0-9b67-65567bb9cef2	0	集成AI对话助手，支持智能问答	2026-06-17 00:21:30.31931	2026-06-17 00:21:30.31931	f	\N
系统监控	system_monitor	1.0.0	FastApiAdmin	https://service.fastapiadmin.com/api/v1/static/image/plugin/monitor.png	monitor	0	/monitor/system	monitor:system	\N	3	3	e14f861c-f3a7-4073-8621-67e290c60e34	0	实时监控系统运行状态，CPU、内存、磁盘等	2026-06-17 00:21:30.319313	2026-06-17 00:21:30.319314	f	\N
工作流引擎	workflow_engine	1.0.0	FastApiAdmin	https://service.fastapiadmin.com/api/v1/static/image/plugin/workflow.png	business	19900	/workflow/design	workflow:design	\N	4	4	8f41d603-76a3-4f4c-89b9-9f6f3a445315	0	可视化工作流设计器，支持审批流程	2026-06-17 00:21:30.319317	2026-06-17 00:21:30.319317	f	\N
数据大屏	data_dashboard	1.0.0	FastApiAdmin	https://service.fastapiadmin.com/api/v1/static/image/plugin/dashboard.png	business	4900	/dashboard/data	dashboard:data	\N	5	5	69d2cccc-2b97-47cc-aaf9-8a17af0b22eb	0	可视化数据大屏，支持多种图表	2026-06-17 00:21:30.31932	2026-06-17 00:21:30.319321	f	\N
\.


--
-- Data for Name: platform_refund; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_refund (order_id, refund_no, amount, reason, refund_transaction_id, reviewer_id, review_time, reject_reason, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
4	RF20260220000001	99900	套餐选择错误，申请退款并更换为标准版	WXREFUND20260220001	2	2026-02-20 16:30:00	\N	1	35b5c121-af7c-41fe-97a8-c15489f2c290	2	创新工坊-专业版退款（已通过）	2026-06-17 00:21:30.423311	2026-06-17 00:21:30.423312	f	\N	4
\.


--
-- Data for Name: platform_tenant; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_tenant (name, code, contact_name, contact_phone, contact_email, address, domain, logo_url, sort, package_id, start_time, end_time, version, favicon, login_bg, copyright, keep_record, help_doc, privacy, clause, git_code, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time) FROM stdin;
平台租户	system	管理员	13800138000	admin@fastapiadmin.com	陕西省西安市	\N	https://service.fastapiadmin.com/api/v1/static/image/logo.svg	0	\N	\N	\N	1.0.0	https://service.fastapiadmin.com/api/v1/static/image/favicon.ico	https://service.fastapiadmin.com/api/v1/static/image/background.svg	Copyright © 2025-2027 service.fastapiadmin.com 版权所有	陕ICP备2025069493号-1	https://docs.fastapiadmin.com	https://fastapiadmin.com/privacy	https://fastapiadmin.com/clause	https://github.com/fastapi-admin/fastapi-admin	1	b3ef79bf-2a02-42ff-bafc-4268b727bab0	0	平台默认租户，id 固定为 1，管理平台所有资源（不受套餐限制）	2026-06-17 00:21:30.313621	2026-06-17 00:21:30.313622	f	\N
测试租户	test	测试管理员	13800138001	test@fastapiadmin.com	上海市浦东新区	test.fastapiadmin.com	https://service.fastapiadmin.com/api/v1/static/image/logo.png	1	2	2024-01-01 00:00:00	2027-12-31 23:59:59	1.0.0	https://service.fastapiadmin.com/api/v1/static/image/favicon.ico	https://service.fastapiadmin.com/api/v1/static/image/background.svg	Copyright © 2024 Test Tenant 版权所有	陕ICP备2024000000号	https://docs.fastapiadmin.com	https://fastapiadmin.com/privacy	https://fastapiadmin.com/clause	\N	2	2fcfbe96-8b04-4c09-844e-314f3614bde8	0	测试租户，用于功能测试	2026-06-17 00:21:30.313627	2026-06-17 00:21:30.313627	f	\N
星辰科技有限公司	STAR	张明	13800001001	zhang@star-tech.dev	\N	\N	\N	0	2	\N	\N	\N	\N	\N	2026 星辰科技	\N	\N	\N	\N	\N	3	cccb20a4-b0bd-4518-8d14-55a1684ef5df	0	中型科技企业，使用标准版套餐	2026-06-17 00:21:30.31598	2026-06-17 00:21:30.315981	f	\N
创新工坊	INNO	李芳	13800002001	li@inno.work	\N	\N	\N	0	1	\N	\N	\N	\N	\N	2026 创新工坊	\N	\N	\N	\N	\N	4	865cf387-2fdd-45b6-a13a-40d6b1f6e96a	0	初创团队，使用基础版免费试用	2026-06-17 00:21:30.315985	2026-06-17 00:21:30.315985	f	\N
\.


--
-- Data for Name: platform_tenant_plugin; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_tenant_plugin (id, tenant_id, plugin_id, enabled, purchased, installed_time) FROM stdin;
1	1	1	1	0	2024-01-01 00:00:00
2	1	2	1	0	2024-01-01 00:00:00
3	1	3	1	0	2024-01-01 00:00:00
4	1	4	1	0	2024-01-01 00:00:00
5	1	5	1	0	2024-01-01 00:00:00
6	2	1	1	0	2024-01-01 00:00:00
7	2	3	1	0	2024-01-01 00:00:00
8	2	5	1	0	2024-01-01 00:00:00
\.


--
-- Data for Name: platform_user_tenant; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.platform_user_tenant (id, user_id, tenant_id, role, is_default, create_time) FROM stdin;
1	1	1	owner	1	2026-06-17 00:21:30.429011
2	2	1	admin	1	2026-06-17 00:21:30.429013
3	3	1	member	1	2026-06-17 00:21:30.429013
4	4	1	member	1	2026-06-17 00:21:30.429014
5	5	1	member	1	2026-06-17 00:21:30.429014
6	1	3	owner	0	2026-06-17 00:21:30.429015
7	6	3	owner	1	2026-06-17 00:21:30.429015
8	7	3	member	1	2026-06-17 00:21:30.429016
9	8	4	owner	1	2026-06-17 00:21:30.429016
10	9	4	member	1	2026-06-17 00:21:30.429016
\.


--
-- Data for Name: sys_dept; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_dept (name, "order", code, leader, phone, email, parent_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
集团总公司	1	GROUP	张总	13800138000	ceo@example.com	\N	1	c993b1da-b0b1-4da5-a715-94a9091c0403	0	集团总部	2026-06-17 00:21:30.368676	2026-06-17 00:21:30.368678	f	\N	1
星辰研发中心	1	STAR_RND	\N	\N	\N	\N	2	e58899cf-cafe-4f73-a800-8f2cd10673a0	0	星辰科技研发部门	2026-06-17 00:21:30.368682	2026-06-17 00:21:30.368683	f	\N	3
星辰市场部	2	STAR_MKT	\N	\N	\N	\N	3	1f9a756a-c53c-4e02-bc8f-c9d3e70c3809	0	星辰科技市场部门	2026-06-17 00:21:30.368686	2026-06-17 00:21:30.368687	f	\N	3
创新产品部	1	INNO_PROD	\N	\N	\N	\N	4	02364ae4-20f3-44bb-8c1c-32b0d35f3b58	0	创新工坊产品团队	2026-06-17 00:21:30.368691	2026-06-17 00:21:30.368691	f	\N	4
创新技术部	2	INNO_TECH	\N	\N	\N	\N	5	ecd74bd1-dda1-4a89-81b4-2e1730150eae	0	创新工坊技术团队	2026-06-17 00:21:30.368694	2026-06-17 00:21:30.368694	f	\N	4
技术研发部	1	TECH	李工	13800138001	tech@example.com	1	6	60313e00-9832-44f4-9d85-67dc36da8202	0	负责技术研发	2026-06-17 00:21:30.370007	2026-06-17 00:21:30.370008	f	\N	1
产品运营部	2	PRODUCT	赵经理	13800138004	product@example.com	1	7	33af0b1b-3b13-4c93-b5d4-d283d2eafad5	0	产品与运营	2026-06-17 00:21:30.370012	2026-06-17 00:21:30.370013	f	\N	1
人力资源部	3	HR	刘经理	13800138005	hr@example.com	1	8	e6d5839e-580e-4846-bfa4-9b3f9fceb1e0	0	人事管理	2026-06-17 00:21:30.370016	2026-06-17 00:21:30.370016	f	\N	1
前端组	1	STAR_FE	\N	\N	\N	2	9	91017d55-c428-43d9-8179-6ed2ab2a1d0e	0	\N	2026-06-17 00:21:30.370019	2026-06-17 00:21:30.37002	f	\N	3
后端组	2	STAR_BE	\N	\N	\N	2	10	bb4ac97b-d49b-471e-b9f8-e1d3d9f585bd	0	\N	2026-06-17 00:21:30.370023	2026-06-17 00:21:30.370023	f	\N	3
测试组	3	STAR_QA	\N	\N	\N	2	11	c9c99e68-d33c-4e25-9aee-439ad791658d	0	\N	2026-06-17 00:21:30.370026	2026-06-17 00:21:30.370026	f	\N	3
后端开发组	1	BACKEND	王工	13800138002	backend@example.com	6	12	3b59a7e9-d5b7-4646-a115-520587d87331	0	后端技术开发	2026-06-17 00:21:30.37089	2026-06-17 00:21:30.370891	f	\N	1
前端开发组	2	FRONTEND	陈工	13800138003	frontend@example.com	6	13	7cf608c2-ae89-449c-b0f8-29e551c10d32	0	前端技术开发	2026-06-17 00:21:30.370895	2026-06-17 00:21:30.370895	f	\N	1
\.


--
-- Data for Name: sys_dict_data; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_dict_data (dict_sort, dict_label, dict_value, css_class, list_class, is_default, dict_type, dict_type_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
1	男	0	blue	\N	t	sys_user_sex	1	1	82622953-9db6-4b97-8b78-18fa0277dab9	0	性别男	2026-06-17 00:21:30.382823	2026-06-17 00:21:30.382824	f	\N	1
2	女	1	pink	\N	f	sys_user_sex	1	2	ea99f2f5-99d5-49f0-b1ed-72af801d81bb	0	性别女	2026-06-17 00:21:30.382828	2026-06-17 00:21:30.382828	f	\N	1
3	未知	2	red	\N	f	sys_user_sex	1	3	9029f91b-6350-42eb-bcea-b4a71541fe52	0	性别未知	2026-06-17 00:21:30.382831	2026-06-17 00:21:30.382832	f	\N	1
1	是	1		primary	t	sys_yes_no	2	4	f9e6eb4a-d95b-409f-b972-af65a46880a9	0	是	2026-06-17 00:21:30.382835	2026-06-17 00:21:30.382835	f	\N	1
2	否	0		danger	f	sys_yes_no	2	5	040f3b9b-dd23-4ebe-9e42-023b3c9d57bd	0	否	2026-06-17 00:21:30.382838	2026-06-17 00:21:30.382838	f	\N	1
1	启用	1		primary	f	sys_common_status	3	6	eeb24fdc-55c6-459d-a468-aeed3155bd7e	0	启用状态	2026-06-17 00:21:30.382841	2026-06-17 00:21:30.382842	f	\N	1
2	停用	0		danger	f	sys_common_status	3	7	f50a77ea-ad45-43b5-a336-a0abff706125	0	停用状态	2026-06-17 00:21:30.382845	2026-06-17 00:21:30.382846	f	\N	1
1	通知	1	blue	warning	t	sys_notice_type	4	8	5de65649-7e34-40ce-9586-7c0cf5f91d16	0	通知	2026-06-17 00:21:30.38285	2026-06-17 00:21:30.38285	f	\N	1
2	公告	2	orange	success	f	sys_notice_type	4	9	2d657d74-0f5d-402d-997d-c255d01e635a	0	公告	2026-06-17 00:21:30.382854	2026-06-17 00:21:30.382854	f	\N	1
99	其他	0		info	f	sys_oper_type	5	10	f683da12-b850-45e2-b5b2-f8b1cc7213cf	0	其他操作	2026-06-17 00:21:30.382858	2026-06-17 00:21:30.382859	f	\N	1
1	新增	1		info	f	sys_oper_type	5	11	f132780a-7f78-42db-bd51-d3f3c9d72724	0	新增操作	2026-06-17 00:21:30.382862	2026-06-17 00:21:30.382863	f	\N	1
2	修改	2		info	f	sys_oper_type	5	12	7ce7038f-c715-4493-81c8-1db4fc737936	0	修改操作	2026-06-17 00:21:30.382866	2026-06-17 00:21:30.382866	f	\N	1
3	删除	3		danger	f	sys_oper_type	5	13	dc692791-e07f-414e-8f00-777cabbf1549	0	删除操作	2026-06-17 00:21:30.382869	2026-06-17 00:21:30.382869	f	\N	1
4	分配权限	4		primary	f	sys_oper_type	5	14	8356762d-dc37-4a1a-83ff-ae5b3eb8c06b	0	授权操作	2026-06-17 00:21:30.382872	2026-06-17 00:21:30.382872	f	\N	1
5	导出	5		warning	f	sys_oper_type	5	15	992ecaf5-d26f-4e08-8c6e-90401a2535b4	0	导出操作	2026-06-17 00:21:30.382875	2026-06-17 00:21:30.382876	f	\N	1
6	导入	6		warning	f	sys_oper_type	5	16	913ddf4b-990a-4fc7-9644-1e1b7a1c159e	0	导入操作	2026-06-17 00:21:30.382879	2026-06-17 00:21:30.382879	f	\N	1
7	强退	7		danger	f	sys_oper_type	5	17	608ee03b-eda5-4951-8cbc-d1a0d8907a86	0	强退操作	2026-06-17 00:21:30.382882	2026-06-17 00:21:30.382882	f	\N	1
8	生成代码	8		warning	f	sys_oper_type	5	18	86afd568-2840-4d03-86eb-b084eca68572	0	生成操作	2026-06-17 00:21:30.382885	2026-06-17 00:21:30.382885	f	\N	1
9	清空数据	9		danger	f	sys_oper_type	5	19	05ece4fa-3112-4de9-9098-53ebea9d0d8d	0	清空操作	2026-06-17 00:21:30.382888	2026-06-17 00:21:30.382889	f	\N	1
1	默认(Memory)	default		\N	t	sys_job_store	6	20	0ec59614-ab98-44dd-be64-a5895127dba3	0	默认分组	2026-06-17 00:21:30.382891	2026-06-17 00:21:30.382892	f	\N	1
2	数据库(Sqlalchemy)	sqlalchemy		\N	f	sys_job_store	6	21	9f1431ce-fa02-45a7-874f-c7dcc991e3b8	0	数据库分组	2026-06-17 00:21:30.382895	2026-06-17 00:21:30.382895	f	\N	1
3	数据库(Redis)	redis		\N	f	sys_job_store	6	22	e8040517-0311-4b95-8943-ce88b09fe826	0	reids分组	2026-06-17 00:21:30.382898	2026-06-17 00:21:30.382898	f	\N	1
1	线程池	default		\N	f	sys_job_executor	7	23	57d69cdf-7cff-4202-998e-92c18b4f3d55	0	线程池	2026-06-17 00:21:30.382901	2026-06-17 00:21:30.382901	f	\N	1
2	进程池	processpool		\N	f	sys_job_executor	7	24	f2719662-4258-46e2-b401-72ff3724483a	0	进程池	2026-06-17 00:21:30.382904	2026-06-17 00:21:30.382905	f	\N	1
1	演示函数	scheduler_test.job		\N	t	sys_job_function	8	25	5f214b98-fbc8-4e4f-90e4-b532ef0b647e	0	演示函数	2026-06-17 00:21:30.382907	2026-06-17 00:21:30.382908	f	\N	1
1	指定日期(date)	date		\N	t	sys_job_trigger	9	26	8e54156e-c091-4c48-9989-88ac48e9eee1	0	指定日期任务触发器	2026-06-17 00:21:30.382911	2026-06-17 00:21:30.382911	f	\N	1
2	间隔触发器(interval)	interval		\N	f	sys_job_trigger	9	27	d8d540b3-0806-4133-88e8-7aa3a9fd8c2a	0	间隔触发器任务触发器	2026-06-17 00:21:30.382914	2026-06-17 00:21:30.382914	f	\N	1
3	cron表达式	cron		\N	f	sys_job_trigger	9	28	fa8cd559-f0d7-4582-9d07-6428f7c369f3	0	间隔触发器任务触发器	2026-06-17 00:21:30.382917	2026-06-17 00:21:30.382917	f	\N	1
1	默认(default)	default		\N	t	sys_list_class	10	29	bdd4f424-4432-4055-94c7-476dc5b097fb	0	默认表格回显样式	2026-06-17 00:21:30.38292	2026-06-17 00:21:30.38292	f	\N	1
2	主要(primary)	primary		\N	f	sys_list_class	10	30	6f7b8973-2266-4ace-9f2e-519ea6f6b074	0	主要表格回显样式	2026-06-17 00:21:30.382923	2026-06-17 00:21:30.382924	f	\N	1
3	成功(success)	success		\N	f	sys_list_class	10	31	05248668-1335-4c87-b3f7-8941744f5a78	0	成功表格回显样式	2026-06-17 00:21:30.382926	2026-06-17 00:21:30.382927	f	\N	1
4	信息(info)	info		\N	f	sys_list_class	10	32	f9ed8a35-927a-47f8-9a00-5ef18040b295	0	信息表格回显样式	2026-06-17 00:21:30.38293	2026-06-17 00:21:30.38293	f	\N	1
5	警告(warning)	warning		\N	f	sys_list_class	10	33	1d3dcabb-857f-4614-852c-002cd004749a	0	警告表格回显样式	2026-06-17 00:21:30.382933	2026-06-17 00:21:30.382933	f	\N	1
6	危险(danger)	danger		\N	f	sys_list_class	10	34	56c412ed-dba5-4a1d-b359-08f97ab6f5f0	0	危险表格回显样式	2026-06-17 00:21:30.382936	2026-06-17 00:21:30.382936	f	\N	1
\.


--
-- Data for Name: sys_dict_type; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_dict_type (dict_name, dict_type, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
用户性别	sys_user_sex	1	385b2511-f334-4fc7-af56-f49f0774856f	0	用户性别列表	2026-06-17 00:21:30.377174	2026-06-17 00:21:30.377175	f	\N	1
系统是否	sys_yes_no	2	13069559-6c2b-495e-8d31-47fe5c016da5	0	系统是否列表	2026-06-17 00:21:30.377179	2026-06-17 00:21:30.37718	f	\N	1
系统状态	sys_common_status	3	616be246-bb4a-4068-ae33-5bbb3c423bde	0	系统状态	2026-06-17 00:21:30.377204	2026-06-17 00:21:30.377204	f	\N	1
通知类型	sys_notice_type	4	e76e7f83-c4c6-4d27-b9d8-2c07832876ab	0	通知类型列表	2026-06-17 00:21:30.377207	2026-06-17 00:21:30.377208	f	\N	1
操作类型	sys_oper_type	5	c7b13705-b416-4c48-ae7a-8601d13087b1	0	操作类型列表	2026-06-17 00:21:30.377211	2026-06-17 00:21:30.377211	f	\N	1
任务存储器	sys_job_store	6	ca03e74f-1578-4973-9d3f-5c947e60641d	0	任务分组列表	2026-06-17 00:21:30.377214	2026-06-17 00:21:30.377214	f	\N	1
任务执行器	sys_job_executor	7	e49772e3-878f-4bc5-9b9e-1d327b714d98	0	任务执行器列表	2026-06-17 00:21:30.377217	2026-06-17 00:21:30.377217	f	\N	1
任务函数	sys_job_function	8	a1caad84-ed96-4ae5-8c43-c97f050fa763	0	任务函数列表	2026-06-17 00:21:30.37722	2026-06-17 00:21:30.377221	f	\N	1
任务触发器	sys_job_trigger	9	5a9c81c7-dcdc-4b3d-ade4-9934661e0a0f	0	任务触发器列表	2026-06-17 00:21:30.377237	2026-06-17 00:21:30.377239	f	\N	1
表格回显样式	sys_list_class	10	830765ea-dcb4-42ba-b9c6-e2c4fa86c2fe	0	表格回显样式列表	2026-06-17 00:21:30.377262	2026-06-17 00:21:30.377262	f	\N	1
\.


--
-- Data for Name: sys_login_log; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_login_log (status, username, login_location, login_ip, request_os, request_browser, msg, id, uuid, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
1	super	陕西省西安市	127.0.0.1	macOS 14.5	Chrome 125	登录成功	1	0a1d481a-66a6-429f-b5f0-b2564fbb9e25	\N	2026-06-17 00:21:30.450898	2026-06-17 00:21:30.4509	f	\N	1	\N	\N	\N
1	admin	陕西省西安市	127.0.0.1	macOS 14.5	Chrome 125	登录成功	2	5674e062-316b-4c32-8a28-0c317218120d	\N	2026-06-17 00:21:30.450904	2026-06-17 00:21:30.450904	f	\N	1	\N	\N	\N
1	user	北京市	192.168.1.100	Windows 11	Edge 125	登录成功	3	b15ca675-0af0-4926-8589-3e028486396d	\N	2026-06-17 00:21:30.450907	2026-06-17 00:21:30.450908	f	\N	1	\N	\N	\N
2	super	广东省深圳市	203.0.113.50	Unknown	Unknown	密码错误，剩余尝试次数: 4	4	9a4051ae-7746-4cce-8044-86db14bb4f06	\N	2026-06-17 00:21:30.450911	2026-06-17 00:21:30.450911	f	\N	1	\N	\N	\N
1	product	上海市	10.0.0.88	macOS 14.6	Safari 17.5	登录成功	5	d085e9aa-b16a-4fa4-a821-d8e685efa940	\N	2026-06-17 00:21:30.450914	2026-06-17 00:21:30.450914	f	\N	1	\N	\N	\N
1	zhang_admin	浙江省杭州市	172.16.0.10	Windows 10	Chrome 124	登录成功	6	379bad90-4871-4105-b6de-cacea9ef220f	\N	2026-06-17 00:21:30.450917	2026-06-17 00:21:30.450918	f	\N	3	\N	\N	\N
1	wang_dev	浙江省杭州市	172.16.0.20	Ubuntu 22.04	Firefox 126	登录成功	7	928c302e-5cde-4ec9-870c-8c0b9d930ba8	\N	2026-06-17 00:21:30.450922	2026-06-17 00:21:30.450923	f	\N	3	\N	\N	\N
1	li_admin	四川省成都市	10.10.10.5	macOS 15.0	Chrome 126	登录成功	8	2de9002d-e48b-416f-8557-deb9949ec45a	\N	2026-06-17 00:21:30.450926	2026-06-17 00:21:30.450927	f	\N	4	\N	\N	\N
1	zhao_eng	四川省成都市	10.10.10.6	macOS 15.0	Chrome 126	登录成功	9	502d48ed-fb60-4b4c-94b4-44d5e0bd3670	\N	2026-06-17 00:21:30.45093	2026-06-17 00:21:30.45093	f	\N	4	\N	\N	\N
2	hr	陕西省西安市	127.0.0.1	Windows 11	Chrome 125	账号已被锁定，请15分钟后重试	10	0e7d0204-78b7-48b1-9d04-181b673563d1	\N	2026-06-17 00:21:30.450933	2026-06-17 00:21:30.450934	f	\N	1	\N	\N	\N
1	super	日本东京	203.104.209.5	iOS 18.0	Safari Mobile	登录成功	11	331053ac-dd4a-43c0-a94d-66743fae2a24	\N	2026-06-17 00:21:30.450936	2026-06-17 00:21:30.450937	f	\N	1	\N	\N	\N
2	test_user	美国洛杉矶	198.51.100.1	Unknown	Unknown	用户不存在	12	39886ce5-8e88-427d-a1b8-473e96447c4b	\N	2026-06-17 00:21:30.45094	2026-06-17 00:21:30.45094	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: sys_notice; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_notice (notice_title, notice_type, notice_content, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
系统上线公告	2	<p>欢迎使用 FastApiAdmin 系统！</p><p>这是一个功能强大的权限管理系统，支持多租户、角色权限控制等功能。</p>	1	c3ad6510-a8c6-4eee-b913-4bbd5afb2df6	0	系统上线公告	2026-06-17 00:21:30.43888	2026-06-17 00:21:30.438881	f	\N	1	\N	\N	\N
系统维护通知	1	<p>系统将于本周六凌晨2:00-4:00进行例行维护，请提前保存工作。</p>	2	78e8be9c-fa14-4433-a2ad-44479d86a800	0	系统维护通知	2026-06-17 00:21:30.438885	2026-06-17 00:21:30.438886	f	\N	1	\N	\N	\N
新功能发布	2	<p>本次更新新增了工作流引擎、代码生成器等功能，欢迎体验！</p>	3	0f131f2b-bcae-40be-8b24-5d9ce0b75712	0	新功能发布	2026-06-17 00:21:30.438889	2026-06-17 00:21:30.438889	f	\N	1	\N	\N	\N
安全更新提醒	1	<p>请所有用户尽快更新密码，建议使用至少8位包含大小写字母、数字和特殊字符的强密码。</p><p>更新方法：登录后进入「个人中心」->「修改密码」。</p>	4	ea06e6c4-02a0-40e0-b9b3-58b4097787c4	0	安全更新提醒	2026-06-17 00:21:30.438892	2026-06-17 00:21:30.438893	f	\N	1	\N	\N	\N
节假日值班安排	1	<p>春节假期（2月10日-2月17日）期间系统值班安排如下：</p><p>联系电话：138-0000-0000</p><p>紧急问题请直接联系值班人员。</p>	5	955ed722-8c9b-439a-82f1-41f658c89c11	0	节假日值班通知	2026-06-17 00:21:30.438896	2026-06-17 00:21:30.438896	f	\N	1	\N	\N	\N
v2.0 版本升级公告	2	<p>v2.0 大版本即将发布，主要更新：</p><ul><li>全新工作流引擎</li><li>AI助手集成</li><li>代码生成器增强</li><li>性能优化 30%</li></ul><p>升级时间另行通知。</p>	6	a637a497-b381-4ee6-af28-dae2d59c5bec	0	v2.0 版本升级公告	2026-06-17 00:21:30.438899	2026-06-17 00:21:30.438899	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: sys_notice_read; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_notice_read (user_id, notice_id, read_time) FROM stdin;
1	1	2025-06-01 09:15:00
1	2	2025-06-10 08:30:00
1	3	2025-07-01 10:00:00
2	1	2025-06-01 09:20:00
2	2	2025-06-10 09:00:00
3	1	2025-06-01 10:30:00
4	1	2025-06-02 14:00:00
5	1	2025-06-03 11:00:00
6	6	2025-06-20 10:00:00
8	2	2025-06-10 16:00:00
\.


--
-- Data for Name: sys_operation_log; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_operation_log (request_path, request_method, request_payload, response_code, response_json, process_time, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
/api/v1/system/auth/login	POST	{"username": "super", "password": "***"}	200	{"code": 200, "msg": "登录成功"}	45ms	1	71bfefbd-5ed2-4fa6-8343-00c8b2e1d9a6	0	用户登录	2026-06-17 00:21:30.455243	2026-06-17 00:21:30.455244	f	\N	1	\N	\N	\N
/api/v1/system/user/current/info	GET	\N	200	{"code": 200, "data": {"username": "super"}}	12ms	2	57776805-805f-4576-a882-24b449af3e06	0	获取当前用户信息	2026-06-17 00:21:30.455249	2026-06-17 00:21:30.455249	f	\N	1	\N	\N	\N
/api/v1/platform/menu/create	POST	{"name": "测试菜单", "type": 2, "parent_id": 1}	200	{"code": 200, "msg": "创建成功"}	23ms	3	2ab5d32d-3387-4f73-b379-04d4e1ff7431	0	创建菜单	2026-06-17 00:21:30.455252	2026-06-17 00:21:30.455253	f	\N	1	\N	\N	\N
/api/v1/system/user/update/3	PUT	{"name": "普通用户", "status": 0}	200	{"code": 200, "msg": "更新成功"}	18ms	4	52cc94a5-3af9-4efe-bfcd-440137bd8bfa	0	更新用户信息	2026-06-17 00:21:30.455256	2026-06-17 00:21:30.455256	f	\N	1	\N	\N	\N
/api/v1/system/dept/create	POST	{"name": "测试部门", "parent_id": 1}	400	{"code": 400, "msg": "部门编码已存在"}	8ms	5	9560f252-5bf5-4f89-95d8-1289b3915e72	0	创建部门（失败）	2026-06-17 00:21:30.455259	2026-06-17 00:21:30.45526	f	\N	1	\N	\N	\N
/api/v1/system/role/delete	DELETE	{"ids": [5]}	200	{"code": 200, "msg": "删除成功"}	15ms	6	97e26ac2-97c4-425b-afcf-54c61d9d93cd	0	删除角色	2026-06-17 00:21:30.455263	2026-06-17 00:21:30.455263	f	\N	1	\N	\N	\N
/api/v1/platform/menu/list	GET	\N	200	{"code": 200, "data": {"items": [...]}}	35ms	7	ac5e9562-f5b2-485f-8b02-417972b465aa	0	查询菜单列表	2026-06-17 00:21:30.455266	2026-06-17 00:21:30.455267	f	\N	3	\N	\N	\N
/api/v1/system/dict/data/list	GET	\N	200	{"code": 200, "data": {"items": [...]}}	22ms	8	027f5ec0-8d09-4c40-a63f-ef700d1832a5	0	查询字典数据	2026-06-17 00:21:30.45527	2026-06-17 00:21:30.45527	f	\N	3	\N	\N	\N
/api/v1/workflow/definition/create	POST	{"name": "审批流程", "code": "approval_v1"}	200	{"code": 200, "msg": "创建成功"}	28ms	9	d7eaca6e-2168-406c-8530-e3135c5791d8	0	创建工作流	2026-06-17 00:21:30.455273	2026-06-17 00:21:30.455273	f	\N	4	\N	\N	\N
/api/v1/system/notice/create	POST	{"notice_title": "测试通知", "notice_type": "1"}	200	{"code": 200, "msg": "创建成功"}	11ms	10	fdb1a5f8-6406-4953-be28-4bd2751d9488	0	创建通知	2026-06-17 00:21:30.455276	2026-06-17 00:21:30.455277	f	\N	1	\N	\N	\N
/api/v1/system/user/export	POST	{"status": 0}	200	{"file": "用户列表_20250601.xlsx"}	156ms	11	03d5dc94-cf24-4300-95ea-4b15760526d0	0	导出用户数据	2026-06-17 00:21:30.45528	2026-06-17 00:21:30.45528	f	\N	1	\N	\N	\N
/api/v1/system/user/import	POST	"file": "users.xlsx" (multipart/form-data)	200	{"code": 200, "msg": "成功导入 25 条数据"}	320ms	12	e4cfa72a-0016-4fb0-ad13-74824208299a	0	批量导入用户	2026-06-17 00:21:30.455283	2026-06-17 00:21:30.455283	f	\N	1	\N	\N	\N
/api/v1/cronjob/node/execute/1	POST	{"trigger": "now"}	200	{"code": 200, "msg": "调试节点成功"}	1024ms	13	46b590de-cc3d-4bc9-8f56-6fc5fbc30c8d	0	执行定时任务节点	2026-06-17 00:21:30.455286	2026-06-17 00:21:30.455287	f	\N	1	\N	\N	\N
/api/v1/workflow/definition/execute	POST	{"workflow_id": 1, "variables": {}}	200	{"code": 200, "data": {"status": "completed"}}	3200ms	14	0f71902a-8669-485d-9d1e-2bc16c25b423	0	执行工作流	2026-06-17 00:21:30.45529	2026-06-17 00:21:30.45529	f	\N	4	\N	\N	\N
/api/v1/cronjob/job/log/delete	DELETE	{"ids": [1, 2, 3]}	200	{"code": 200, "msg": "删除成功"}	19ms	15	f095a2c0-e5d4-490c-a641-4e634abb25c4	0	批量删除执行日志	2026-06-17 00:21:30.455293	2026-06-17 00:21:30.455294	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: sys_param; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_param (config_name, config_key, config_value, config_type, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
演示模式启用	demo_enable	false	t	1	76181d1a-7298-4079-8770-cdbd73a37c86	0	是否启用演示模式	2026-06-17 00:21:30.36406	2026-06-17 00:21:30.364061	f	\N	1
演示访问IP白名单	ip_white_list	["127.0.0.1", "::1"]	t	2	8d74ef7c-efb2-4f2c-a388-f3080b893dda	0	演示模式下允许访问的IP列表	2026-06-17 00:21:30.364065	2026-06-17 00:21:30.364066	f	\N	1
接口白名单	white_api_list_path	["/api/v1/system/auth/login", "/api/v1/system/auth/token/refresh", "/api/v1/system/auth/captcha/get", "/api/v1/system/auth/logout", "/api/v1/system/config/info", "/api/v1/system/user/current/info", "/api/v1/system/notice/available", "/api/v1/system/auth/auto-login/users", "/api/v1/system/auth/auto-login/token", "/api/v1/system/auth/auto-login", "/common/health", "/common/health/ready", "/common/health/live", "/metrics"]	t	3	1443bf5f-d4dd-46f8-aa46-94503c11e2f8	0	无需登录即可访问的接口列表	2026-06-17 00:21:30.364069	2026-06-17 00:21:30.364069	f	\N	1
访问IP黑名单	ip_black_list	[]	t	4	121a8eaa-0e62-4e51-a482-3553700f784c	0	禁止访问的IP列表	2026-06-17 00:21:30.364072	2026-06-17 00:21:30.364072	f	\N	1
登录失败次数限制	login_failed_limit	5	t	5	3b7fc693-afd2-46dc-921c-f78af42c5f06	0	登录失败最大次数	2026-06-17 00:21:30.364075	2026-06-17 00:21:30.364076	f	\N	1
登录锁定时间(分钟)	login_lock_time	15	t	6	040109a2-4e87-4a47-9607-e645a5e39b46	0	登录失败后锁定时间	2026-06-17 00:21:30.364079	2026-06-17 00:21:30.364079	f	\N	1
Token过期时间(分钟)	token_expire_minutes	120	t	7	c01d25ac-c5c6-4989-ba82-292b771e3ca1	0	Access Token过期时间	2026-06-17 00:21:30.364082	2026-06-17 00:21:30.364082	f	\N	1
Refresh Token过期时间(天)	refresh_token_expire_days	7	t	8	7c17df22-ef10-489b-92a9-14a59819652a	0	Refresh Token过期时间	2026-06-17 00:21:30.364085	2026-06-17 00:21:30.364085	f	\N	1
密码有效期(天)	password_expire_days	90	t	9	524bab19-827d-413d-b76e-0edd5a1f128c	0	密码有效期	2026-06-17 00:21:30.364088	2026-06-17 00:21:30.364088	f	\N	1
密码最小长度	password_min_length	6	t	10	fbd4aa1d-ba34-4c0f-b499-0e378900dd25	0	密码最小长度	2026-06-17 00:21:30.364091	2026-06-17 00:21:30.364092	f	\N	1
是否启用验证码	captcha_enable	true	t	11	ef68aaa2-abed-4fdc-a0dc-876b79192566	0	登录时是否启用验证码	2026-06-17 00:21:30.364094	2026-06-17 00:21:30.364095	f	\N	1
是否记录操作日志	operation_log_enable	true	t	12	85393bf1-d391-4fb7-bde7-8369b2a2ab9a	0	是否记录用户操作日志	2026-06-17 00:21:30.364098	2026-06-17 00:21:30.364098	f	\N	1
操作日志保留天数	operation_log_retention_days	90	t	13	fbac894f-d8fd-4b25-8b0e-03635326830e	0	操作日志保留天数	2026-06-17 00:21:30.364101	2026-06-17 00:21:30.364102	f	\N	1
登录日志保留天数	login_log_retention_days	30	t	14	1db2cdd3-4686-4cb8-aac9-0ba1ad2f9d69	0	登录日志保留天数	2026-06-17 00:21:30.364105	2026-06-17 00:21:30.364105	f	\N	1
文件上传大小限制(MB)	file_upload_max_size	50	t	15	ff5db1b8-de66-4981-b16a-7e5b1f83e2df	0	单个文件上传最大大小	2026-06-17 00:21:30.364108	2026-06-17 00:21:30.364108	f	\N	1
是否启用IP归属地查询	ip_location_enable	false	t	16	7bca54e8-82eb-4bd2-a283-6465aa39900e	0	登录时是否查询IP归属地	2026-06-17 00:21:30.364111	2026-06-17 00:21:30.364111	f	\N	1
调度器状态	scheduler_status	stopped	t	17	f87b3017-43a4-428c-b488-dc908c4ac8e0	0	\N	2026-06-17 00:21:38.35444	2026-06-17 00:21:38.354443	f	\N	1
\.


--
-- Data for Name: sys_position; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_position (name, code, "order", id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
技术总监	TECH_DIRECTOR	1	1	bd8a01b8-0da1-4c5d-923c-a6d21d2a02c3	0	技术部门负责人	2026-06-17 00:21:30.387719	2026-06-17 00:21:30.38772	f	\N	1	\N	\N	\N
高级工程师	SR_ENGINEER	2	2	d942f31c-d958-49d5-b870-a9058978d336	0	高级技术岗位	2026-06-17 00:21:30.387724	2026-06-17 00:21:30.387725	f	\N	1	\N	\N	\N
工程师	ENGINEER	3	3	b9626313-5a15-4e94-b1e7-973fc8ba9d33	0	技术岗位	2026-06-17 00:21:30.387728	2026-06-17 00:21:30.387729	f	\N	1	\N	\N	\N
产品经理	PRODUCT_MANAGER	4	4	04ca058b-b440-4ae7-b85a-4538c72bca50	0	产品管理岗位	2026-06-17 00:21:30.387732	2026-06-17 00:21:30.387732	f	\N	1	\N	\N	\N
运营专员	OPERATOR	5	5	f528a4f5-6a31-4e1e-900e-374886800108	0	运营岗位	2026-06-17 00:21:30.387735	2026-06-17 00:21:30.387736	f	\N	1	\N	\N	\N
HR专员	HR_STAFF	6	6	c7d385b6-d132-477c-8a36-8091143fbd06	0	人事专员	2026-06-17 00:21:30.387739	2026-06-17 00:21:30.387739	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: sys_role; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_role (name, code, "order", data_scope, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
超级管理员	SUPER_ADMIN	1	4	1	6f4ed572-650c-47af-a354-7e24db218539	0	拥有系统最高权限	2026-06-17 00:21:30.37375	2026-06-17 00:21:30.373751	f	\N	1
管理员	ADMIN	2	3	2	854bcf57-c7d3-4306-b2bd-133298ffc74c	0	管理租户内所有资源	2026-06-17 00:21:30.373755	2026-06-17 00:21:30.373756	f	\N	1
普通用户	USER	3	1	3	a7f5f4b4-1317-4094-be4a-a455347a2cf8	0	仅能查看和操作自己的数据	2026-06-17 00:21:30.373759	2026-06-17 00:21:30.373759	f	\N	1
星辰管理员	STAR_ADMIN	1	4	4	78665473-6122-49c4-b99b-01e30e970259	0	星辰科技有限公司管理员	2026-06-17 00:21:30.373762	2026-06-17 00:21:30.373763	f	\N	3
星辰员工	STAR_STAFF	2	2	5	bc44e6fe-31e9-49ba-bd27-d3a2b226ee95	0	星辰科技有限公司普通员工	2026-06-17 00:21:30.373766	2026-06-17 00:21:30.373766	f	\N	3
创新管理员	INNO_ADMIN	1	4	6	8cca0cd1-088a-4579-ab0a-f215568f006f	0	创新工坊管理员	2026-06-17 00:21:30.373769	2026-06-17 00:21:30.373769	f	\N	4
创新员工	INNO_STAFF	2	2	7	c93319c9-5c46-41b0-91b0-8626221fc1d3	0	创新工坊普通员工	2026-06-17 00:21:30.373772	2026-06-17 00:21:30.373772	f	\N	4
\.


--
-- Data for Name: sys_role_depts; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_role_depts (role_id, dept_id) FROM stdin;
\.


--
-- Data for Name: sys_role_menus; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_role_menus (role_id, menu_id) FROM stdin;
\.


--
-- Data for Name: sys_ticket; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_ticket (title, ticket_content, summary, ticket_type, images, reply, assigned_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
系统登录页面优化建议	<p>建议在登录页面增加记住密码功能和第三方登录入口，提升用户体验。</p>	建议在登录页面增加记住密码功能和第三方登录入口	suggestion	\N	感谢您的建议，我们将在下个版本中加入记住密码功能。	2	1	9af641c2-8c21-43b1-846f-e638c8e7b8c0	2	用户体验优化	2026-06-17 00:21:30.446285	2026-06-17 00:21:30.446287	f	\N	1	\N	\N	\N
表格导出功能异常	<p>当数据量超过1000条时，导出Excel功能会超时失败。</p>	数据量超过1000条导出Excel超时	bug	\N	\N	3	2	9c79b610-17b1-4afb-b083-468b682c34d0	1	导出功能问题	2026-06-17 00:21:30.446291	2026-06-17 00:21:30.446292	f	\N	1	\N	\N	\N
希望增加批量删除功能	<p>用户管理页面希望支持批量选择删除，提高管理效率。</p>	用户管理页面希望支持批量选择删除	optimize	\N	\N	\N	3	c361873e-c48e-4e9c-b852-0cfd70ef7b20	0	功能优化建议	2026-06-17 00:21:30.446295	2026-06-17 00:21:30.446295	f	\N	1	\N	\N	\N
手机端适配问题反馈	<p>在iPhone Safari浏览器上，菜单栏折叠后无法展开，需要刷新页面才能恢复。</p>	iPhone Safari菜单折叠后无法展开	bug	["https://example.com/screenshot1.png"]	\N	4	4	cec1f308-fc71-49c7-91ed-c626844bc71d	1	移动端兼容性问题	2026-06-17 00:21:30.446298	2026-06-17 00:21:30.446299	f	\N	1	\N	\N	\N
增加数据权限粒度	<p>当前数据权限只能控制到部门级别，希望能支持自定义数据范围，如只查看本人创建的数据、指定项目范围等。</p>	数据权限需要支持自定义范围	optimize	\N	已纳入Q3规划，感谢反馈。	2	5	95c170aa-d05c-4422-976b-961f01e0b5d6	2	数据权限增强	2026-06-17 00:21:30.446302	2026-06-17 00:21:30.446302	f	\N	1	\N	\N	\N
工作流审批节点无法修改	<p>已发布的工作流无法修改审批节点配置，需要先取消发布才能修改，操作繁琐。</p>	已发布工作流无法直接修改节点	bug	\N	\N	\N	6	27942d15-1029-4d83-a790-414afdcd84c6	0	星辰科技反馈工作流问题	2026-06-17 00:21:30.446305	2026-06-17 00:21:30.446306	f	\N	3	\N	\N	\N
希望增加钉钉集成	<p>团队使用钉钉进行日常协作，希望能将通知和待办事项同步到钉钉工作台。</p>	希望支持钉钉消息集成	suggestion	\N	我们会评估第三方集成的优先级。	\N	7	5f91e159-18d3-4674-9a74-290689e5caf6	3	创新工坊第三方集成需求	2026-06-17 00:21:30.446309	2026-06-17 00:21:30.446309	f	\N	4	\N	\N	\N
其他-文档链接失效	<p>帮助文档中的API接口说明链接跳转404，影响开发对接。</p>	帮助文档API链接404	other	\N	\N	3	8	c00eaad7-6927-4035-866e-99cf89261afb	0	文档链接问题	2026-06-17 00:21:30.446312	2026-06-17 00:21:30.446312	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: sys_user; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_user (username, password, name, mobile, email, gender, avatar, is_superuser, last_login, gitee_login, github_login, wx_login, qq_login, dept_id, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
super	$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa	超级管理员	13800138000	super@example.com	0	https://service.fastapiadmin.com/api/v1/static/image/avatar.png	t	\N	\N	\N	\N	\N	1	1	52d0624a-333c-43d8-9241-63a7af84293a	0	系统超级管理员	2026-06-17 00:21:30.397062	2026-06-17 00:21:30.397064	f	\N	1	\N	\N	\N
admin	$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa	管理员	13800138001	admin@example.com	0	https://service.fastapiadmin.com/api/v1/static/image/avatar.png	t	\N	\N	\N	\N	\N	2	2	a092f4c7-6977-4fe2-97e4-66ff50d5e626	0	技术部门管理员	2026-06-17 00:21:30.397069	2026-06-17 00:21:30.39707	f	\N	1	1	\N	\N
user	$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa	普通用户	13800138002	user@example.com	0	https://service.fastapiadmin.com/api/v1/static/image/avatar.png	f	\N	\N	\N	\N	\N	3	3	b08ba61e-a5d8-4035-9bdf-f9568ce959c5	0	后端开发工程师	2026-06-17 00:21:30.397073	2026-06-17 00:21:30.397073	f	\N	1	1	\N	\N
product	$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa	产品经理	13800138003	product@example.com	1	https://service.fastapiadmin.com/api/v1/static/image/avatar.png	f	\N	\N	\N	\N	\N	5	4	e48b05fc-8cc6-4e51-a1eb-89ffe5e28309	0	产品经理	2026-06-17 00:21:30.397077	2026-06-17 00:21:30.397077	f	\N	1	1	\N	\N
hr	$2b$12$e2IJgS/cvHgJ0H3G7Xa08OXoXnk6N/NX3IZRtubBDElA0VLZhkNOa	HR专员	13800138004	hr@example.com	1	https://service.fastapiadmin.com/api/v1/static/image/avatar.png	f	\N	\N	\N	\N	\N	6	5	035a1d93-5438-49b7-b75e-8929ea20e40d	0	人力资源专员	2026-06-17 00:21:30.39708	2026-06-17 00:21:30.397081	f	\N	1	1	\N	\N
zhang_admin	$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe	张明	13800001001	zhang@star-tech.dev	2	\N	f	\N	\N	\N	\N	\N	\N	6	bb5ff822-0c90-4375-b78f-2baff1bcab47	0	星辰科技管理员	2026-06-17 00:21:30.399531	2026-06-17 00:21:30.399533	f	\N	3	\N	\N	\N
wang_dev	$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe	王华	13800001002	wang@star-tech.dev	2	\N	f	\N	\N	\N	\N	\N	\N	7	06888386-60b3-4c83-b5e3-f60457161577	0	星辰科技研发工程师	2026-06-17 00:21:30.399538	2026-06-17 00:21:30.399538	f	\N	3	\N	\N	\N
li_admin	$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe	李芳	13800002001	li@inno.work	2	\N	f	\N	\N	\N	\N	\N	\N	8	dac7ebe1-5d89-4803-81f1-98da53b07261	0	创新工坊创始人	2026-06-17 00:21:30.399542	2026-06-17 00:21:30.399542	f	\N	4	\N	\N	\N
zhao_eng	$2b$12$rej/LQJMp5Zujt2YglsaCulQ4wNzYlPupSG0glJPYGzt.nSMV5QDe	赵强	13800002002	zhao@inno.work	2	\N	f	\N	\N	\N	\N	\N	\N	9	4357a8e3-add4-4d24-b7b6-11f72e85c181	0	创新工坊技术合伙人	2026-06-17 00:21:30.399545	2026-06-17 00:21:30.399546	f	\N	4	\N	\N	\N
\.


--
-- Data for Name: sys_user_positions; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_user_positions (user_id, position_id) FROM stdin;
\.


--
-- Data for Name: sys_user_roles; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sys_user_roles (user_id, role_id) FROM stdin;
1	1
2	2
3	3
4	3
5	3
6	4
7	5
8	6
9	7
\.


--
-- Data for Name: task_job; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.task_job (job_id, job_name, trigger_type, status, next_run_time, job_state, result, error, id, uuid, description, created_time, updated_time, is_deleted, deleted_time, tenant_id) FROM stdin;
system_tenant_expiry_check	租户到期检查	interval	pending	2026-06-17 01:21:30.550363+08:00	{\n  "version": 1,\n  "id": "system_tenant_expiry_check",\n  "func": "app.api.v1.module_platform.tenant.service:TenantService.check_tenant_expiry",\n  "trigger": "interval[1:00:00]",\n  "executor": "default",\n  "args": [],\n  "kwargs": {},\n  "name": "租户到期检查",\n  "misfire_grace_time": 1,\n  "coalesce": true,\n  "max_instances": 5,\n  "next_run_time": "2026-06-17 01:21:30.550363+08:00"\n}	\N	\N	1	27022f86-9e39-40a8-86cd-f1ffeb40cba6	\N	2026-06-17 00:21:30.555117	2026-06-17 00:21:30.555118	f	\N	1
system_grace_reminder	宽限期续费提醒	cron	pending	2026-06-17 09:00:00+08:00	{\n  "version": 1,\n  "id": "system_grace_reminder",\n  "func": "app.api.v1.module_platform.tenant.service:TenantService.send_grace_reminders",\n  "trigger": "cron[hour='9', minute='0']",\n  "executor": "default",\n  "args": [],\n  "kwargs": {},\n  "name": "宽限期续费提醒",\n  "misfire_grace_time": 1,\n  "coalesce": true,\n  "max_instances": 5,\n  "next_run_time": "2026-06-17 09:00:00+08:00"\n}	\N	\N	2	788ba8f2-a3c4-46c9-bcba-8709871a8ff2	\N	2026-06-17 00:21:30.564823	2026-06-17 00:21:30.564824	f	\N	1
system_clean_expired	过期租户归档清理	cron	pending	2026-07-01 02:00:00+08:00	{\n  "version": 1,\n  "id": "system_clean_expired",\n  "func": "app.api.v1.module_platform.tenant.service:TenantService.clean_expired_tenants",\n  "trigger": "cron[day='1', hour='2', minute='0']",\n  "executor": "default",\n  "args": [],\n  "kwargs": {},\n  "name": "过期租户归档清理",\n  "misfire_grace_time": 1,\n  "coalesce": true,\n  "max_instances": 5,\n  "next_run_time": "2026-07-01 02:00:00+08:00"\n}	\N	\N	3	736e4fb8-7f55-4176-af0a-d809c80833a0	\N	2026-06-17 00:21:30.569196	2026-06-17 00:21:30.569197	f	\N	1
system_cancel_expired_orders	超时订单取消	interval	pending	2026-06-17 00:26:30.571867+08:00	{\n  "version": 1,\n  "id": "system_cancel_expired_orders",\n  "func": "app.api.v1.module_platform.order.service:OrderService.cancel_expired_orders",\n  "trigger": "interval[0:05:00]",\n  "executor": "default",\n  "args": [],\n  "kwargs": {},\n  "name": "超时订单取消",\n  "misfire_grace_time": 1,\n  "coalesce": true,\n  "max_instances": 5,\n  "next_run_time": "2026-06-17 00:26:30.571867+08:00"\n}	\N	\N	4	4cdd985a-f04a-49b2-bf86-dd272f522f72	\N	2026-06-17 00:21:30.572895	2026-06-17 00:21:30.572896	f	\N	1
system_cleanup_operation_log	操作日志清理	cron	pending	2026-06-21 03:00:00+08:00	{\n  "version": 1,\n  "id": "system_cleanup_operation_log",\n  "func": "app.api.v1.module_system.log.service:OperationLogService.cleanup_operation_log",\n  "trigger": "cron[day_of_week='sun', hour='3', minute='0']",\n  "executor": "default",\n  "args": [],\n  "kwargs": {},\n  "name": "操作日志清理",\n  "misfire_grace_time": 1,\n  "coalesce": true,\n  "max_instances": 5,\n  "next_run_time": "2026-06-21 03:00:00+08:00"\n}	\N	\N	5	d29563d8-14cd-4e78-a1b2-993ce832d216	\N	2026-06-17 00:21:30.576771	2026-06-17 00:21:30.576772	f	\N	1
\.


--
-- Data for Name: task_node; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.task_node (name, code, jobstore, executor, trigger, trigger_args, func, args, kwargs, "coalesce", max_instances, start_date, end_date, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
演示任务	demo_job	default	default	\N	\N	import logging\n\ndef handler(*args, **kwargs):\n    """演示任务：打印参数并返回执行摘要"""\n    logger = logging.getLogger(__name__)\n    logger.info(f"演示任务执行中，参数: args={args}, kwargs={kwargs}")\n    return {\n        "status": "success",\n        "message": "演示任务执行成功",\n        "args_received": len(args),\n        "kwargs_keys": list(kwargs.keys())\n    }\n	\N	\N	f	1	\N	\N	1	35bb1567-2194-42a9-82fc-f5360bc01293	0	最简演示任务，用于验证调度器基本功能	2026-06-17 00:21:30.45975	2026-06-17 00:21:30.459752	f	\N	1	\N	\N	\N
数据库清理任务	db_cleanup	sqlalchemy	default	\N	\N	import logging\nfrom datetime import datetime, timedelta\n\ndef handler(*args, **kwargs):\n    """清理过期数据：删除N天前的日志和临时数据"""\n    logger = logging.getLogger(__name__)\n    days = kwargs.get("days", 90)\n    cutoff = datetime.now() - timedelta(days=days)\n    logger.info(f"清理 {cutoff.strftime('%Y-%m-%d')} 之前的过期数据...")\n    return {\n        "status": "success",\n        "cutoff_date": cutoff.strftime("%Y-%m-%d %H:%M:%S"),\n        "deleted_count": 0\n    }\n	\N	{"days": 30}	t	1	\N	\N	2	0146ccfa-88e9-4a69-bfd0-c2df8b385168	0	清理过期操作日志和临时数据，建议每天凌晨3点执行	2026-06-17 00:21:30.459756	2026-06-17 00:21:30.459757	f	\N	1	\N	\N	\N
健康检查任务	health_check	default	default	\N	\N	import logging\nimport psutil\n\ndef handler(*args, **kwargs):\n    """系统健康检查：采集 CPU、内存、磁盘使用率"""\n    logger = logging.getLogger(__name__)\n    cpu = psutil.cpu_percent(interval=1)\n    mem = psutil.virtual_memory()\n    disk = psutil.disk_usage("/")\n    status = "healthy" if cpu < 80 and mem.percent < 90 and disk.percent < 90 else "warning"\n    logger.info(f"健康检查: CPU={cpu}% MEM={mem.percent}% DISK={disk.percent}%")\n    return {\n        "status": status,\n        "cpu_percent": cpu,\n        "memory_percent": mem.percent,\n        "disk_percent": disk.percent,\n        "memory_total_gb": round(mem.total / (1024**3), 1),\n        "disk_total_gb": round(disk.total / (1024**3), 1)\n    }\n	\N	\N	t	1	\N	\N	3	03d7ab4f-604e-4cd8-a20d-e721d29c138b	0	系统资源健康检查，建议每5分钟执行一次	2026-06-17 00:21:30.45976	2026-06-17 00:21:30.459761	f	\N	1	\N	\N	\N
邮件批量发送	email_batch	sqlalchemy	default	\N	\N	import logging\n\ndef handler(*args, **kwargs):\n    """批量发送待发送邮件"""\n    logger = logging.getLogger(__name__)\n    batch_size = kwargs.get("batch_size", 50)\n    logger.info(f"开始批量发送邮件，每批 {batch_size} 封...")\n    return {\n        "status": "success",\n        "sent_count": 0,\n        "failed_count": 0,\n        "batch_size": batch_size\n    }\n	\N	{"batch_size": 50}	f	2	\N	\N	4	9087fffb-fba2-4410-8e6c-97ea0530104f	0	批量发送待发送邮件，建议每分钟执行一次	2026-06-17 00:21:30.459764	2026-06-17 00:21:30.459764	f	\N	1	\N	\N	\N
\.


--
-- Data for Name: task_workflow; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.task_workflow (name, code, workflow_status, nodes, edges, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
\.


--
-- Data for Name: task_workflow_node_type; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.task_workflow_node_type (name, code, category, func, args, kwargs, sort_order, is_active, id, uuid, status, description, created_time, updated_time, is_deleted, deleted_time, tenant_id, created_id, updated_id, deleted_id) FROM stdin;
HTTP请求	http_request	action	import json\nimport urllib.request\n\ndef handler(*args, **kwargs):\n    """发送 HTTP 请求并返回响应"""\n    url = kwargs.get("url", "")\n    method = kwargs.get("method", "GET")\n    headers = kwargs.get("headers", {})\n    body = kwargs.get("body")\n    if not url:\n        raise ValueError("缺少 url 参数")\n    req = urllib.request.Request(url, method=method, headers=headers)\n    if body and isinstance(body, dict):\n        req.data = json.dumps(body).encode()\n    with urllib.request.urlopen(req) as resp:\n        return {"status_code": resp.status, "body": resp.read().decode()}\n	\N	{"url": "", "method": "GET"}	1	t	1	7b265628-1b81-4d81-90e9-65b8ae16b7a5	0	发送 HTTP 请求，支持 GET/POST 等方法	2026-06-17 00:21:30.464515	2026-06-17 00:21:30.464516	f	\N	1	\N	\N	\N
发送通知	send_notification	action	import logging\n\ndef handler(*args, **kwargs):\n    """发送通知消息"""\n    logger = logging.getLogger(__name__)\n    channel = kwargs.get("channel", "system")\n    title = kwargs.get("title", "工作流通知")\n    content = kwargs.get("content", "")\n    recipients = kwargs.get("recipients", [])\n    logger.info(f"[{channel}] 发送通知: {title} -> {len(recipients)}人")\n    return {\n        "channel": channel,\n        "title": title,\n        "recipient_count": len(recipients),\n        "status": "sent"\n    }\n	\N	{"channel": "system", "title": "工作流通知", "recipients": []}	2	t	2	cb12b484-3454-4f6d-89b3-17ee81953012	0	发送系统通知、邮件或短信	2026-06-17 00:21:30.46452	2026-06-17 00:21:30.464521	f	\N	1	\N	\N	\N
条件判断	condition	condition	import json\n\ndef handler(*args, **kwargs):\n    """条件分支：根据 upstream 结果决定走向"""\n    upstream = kwargs.get("upstream", {})\n    variables = kwargs.get("variables", {})\n    field = kwargs.get("field", "status")\n    expected = kwargs.get("expected", "success")\n    operator = kwargs.get("operator", "eq")\n    last = list(upstream.values())[-1] if upstream else {}\n    actual = last.get(field) if isinstance(last, dict) else last\n    operations = {\n        "eq": lambda a, e: a == e,\n        "ne": lambda a, e: a != e,\n        "gt": lambda a, e: a > e,\n        "lt": lambda a, e: a < e,\n        "contains": lambda a, e: str(e) in str(a)\n    }\n    op = operations.get(operator, operations["eq"])\n    result = op(actual, expected)\n    return {"passed": result, "actual": actual, "expected": expected}\n	\N	{"field": "status", "expected": "success", "operator": "eq"}	3	t	3	7869013c-ef53-42dc-a04b-d5913c3cfc05	0	根据上游节点输出判断分支走向	2026-06-17 00:21:30.464524	2026-06-17 00:21:30.464525	f	\N	1	\N	\N	\N
数据转换	data_transform	action	import json\nfrom datetime import datetime\n\ndef handler(*args, **kwargs):\n    """转换上游数据格式"""\n    upstream = kwargs.get("upstream", {})\n    mapping = kwargs.get("mapping", {})\n    result = {}\n    for upstream_key, target_key in mapping.items():\n        for source, value in upstream.items():\n            if isinstance(value, dict) and upstream_key in value:\n                result[target_key] = value[upstream_key]\n    result["transformed_at"] = datetime.now().isoformat()\n    return result\n	\N	{"mapping": {}}	4	t	4	b3de912b-bf29-49e3-a50e-ccde37275675	0	转换上游节点的数据格式	2026-06-17 00:21:30.464528	2026-06-17 00:21:30.464528	f	\N	1	\N	\N	\N
聚合汇总	aggregate	action	import json\n\ndef handler(*args, **kwargs):\n    """聚合上游多个节点的输出"""\n    upstream = kwargs.get("upstream", {})\n    variables = kwargs.get("variables", {})\n    results = {\n        "node_count": len(upstream),\n        "nodes": list(upstream.keys()),\n        "values": list(upstream.values()),\n        "variables": variables\n    }\n    return results\n	\N	\N	5	t	5	138b569e-288b-43e7-b6b6-1fe00a770de3	0	将多个上游节点的输出聚合到一个结果中	2026-06-17 00:21:30.464531	2026-06-17 00:21:30.464532	f	\N	1	\N	\N	\N
\.


--
-- Name: example_demo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.example_demo_id_seq', 6, true);


--
-- Name: gen_table_column_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.gen_table_column_id_seq', 1, false);


--
-- Name: gen_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.gen_table_id_seq', 1, false);


--
-- Name: platform_email_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_email_config_id_seq', 1, true);


--
-- Name: platform_email_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_email_log_id_seq', 1, false);


--
-- Name: platform_email_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_email_template_id_seq', 6, true);


--
-- Name: platform_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_invoice_id_seq', 4, true);


--
-- Name: platform_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_menu_id_seq', 220, true);


--
-- Name: platform_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_order_id_seq', 9, true);


--
-- Name: platform_package_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_package_id_seq', 4, true);


--
-- Name: platform_package_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_package_menu_id_seq', 30, true);


--
-- Name: platform_package_plugin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_package_plugin_id_seq', 1, false);


--
-- Name: platform_payment_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_payment_record_id_seq', 7, true);


--
-- Name: platform_plugin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_plugin_id_seq', 5, true);


--
-- Name: platform_refund_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_refund_id_seq', 1, true);


--
-- Name: platform_tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_tenant_id_seq', 4, true);


--
-- Name: platform_tenant_plugin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_tenant_plugin_id_seq', 8, true);


--
-- Name: platform_user_tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.platform_user_tenant_id_seq', 10, true);


--
-- Name: sys_dept_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_dept_id_seq', 13, true);


--
-- Name: sys_dict_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_dict_data_id_seq', 34, true);


--
-- Name: sys_dict_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_dict_type_id_seq', 10, true);


--
-- Name: sys_login_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_login_log_id_seq', 12, true);


--
-- Name: sys_notice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_notice_id_seq', 6, true);


--
-- Name: sys_operation_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_operation_log_id_seq', 15, true);


--
-- Name: sys_param_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_param_id_seq', 17, true);


--
-- Name: sys_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_position_id_seq', 6, true);


--
-- Name: sys_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_role_id_seq', 7, true);


--
-- Name: sys_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_ticket_id_seq', 8, true);


--
-- Name: sys_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sys_user_id_seq', 9, true);


--
-- Name: task_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.task_job_id_seq', 5, true);


--
-- Name: task_node_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.task_node_id_seq', 4, true);


--
-- Name: task_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.task_workflow_id_seq', 1, false);


--
-- Name: task_workflow_node_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.task_workflow_node_type_id_seq', 5, true);


--
-- Name: apscheduler_jobs apscheduler_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.apscheduler_jobs
    ADD CONSTRAINT apscheduler_jobs_pkey PRIMARY KEY (id);


--
-- Name: example_demo example_demo_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo
    ADD CONSTRAINT example_demo_pkey PRIMARY KEY (id);


--
-- Name: gen_table_column gen_table_column_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_pkey PRIMARY KEY (id);


--
-- Name: gen_table gen_table_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table
    ADD CONSTRAINT gen_table_pkey PRIMARY KEY (id);


--
-- Name: platform_email_config platform_email_config_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_config
    ADD CONSTRAINT platform_email_config_name_key UNIQUE (name);


--
-- Name: platform_email_config platform_email_config_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_config
    ADD CONSTRAINT platform_email_config_pkey PRIMARY KEY (id);


--
-- Name: platform_email_log platform_email_log_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_log
    ADD CONSTRAINT platform_email_log_pkey PRIMARY KEY (id);


--
-- Name: platform_email_template platform_email_template_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_template
    ADD CONSTRAINT platform_email_template_name_key UNIQUE (name);


--
-- Name: platform_email_template platform_email_template_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_template
    ADD CONSTRAINT platform_email_template_pkey PRIMARY KEY (id);


--
-- Name: platform_email_template platform_email_template_template_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_template
    ADD CONSTRAINT platform_email_template_template_code_key UNIQUE (template_code);


--
-- Name: platform_invoice platform_invoice_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice
    ADD CONSTRAINT platform_invoice_invoice_no_key UNIQUE (invoice_no);


--
-- Name: platform_invoice platform_invoice_order_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice
    ADD CONSTRAINT platform_invoice_order_id_key UNIQUE (order_id);


--
-- Name: platform_invoice platform_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice
    ADD CONSTRAINT platform_invoice_pkey PRIMARY KEY (id);


--
-- Name: platform_menu platform_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_menu
    ADD CONSTRAINT platform_menu_pkey PRIMARY KEY (id);


--
-- Name: platform_order platform_order_order_no_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order
    ADD CONSTRAINT platform_order_order_no_key UNIQUE (order_no);


--
-- Name: platform_order platform_order_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order
    ADD CONSTRAINT platform_order_pkey PRIMARY KEY (id);


--
-- Name: platform_package platform_package_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package
    ADD CONSTRAINT platform_package_code_key UNIQUE (code);


--
-- Name: platform_package_menu platform_package_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_menu
    ADD CONSTRAINT platform_package_menu_pkey PRIMARY KEY (id);


--
-- Name: platform_package platform_package_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package
    ADD CONSTRAINT platform_package_name_key UNIQUE (name);


--
-- Name: platform_package platform_package_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package
    ADD CONSTRAINT platform_package_pkey PRIMARY KEY (id);


--
-- Name: platform_package_plugin platform_package_plugin_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_plugin
    ADD CONSTRAINT platform_package_plugin_pkey PRIMARY KEY (id);


--
-- Name: platform_payment_record platform_payment_record_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_payment_record
    ADD CONSTRAINT platform_payment_record_pkey PRIMARY KEY (id);


--
-- Name: platform_payment_record platform_payment_record_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_payment_record
    ADD CONSTRAINT platform_payment_record_transaction_id_key UNIQUE (transaction_id);


--
-- Name: platform_plugin platform_plugin_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_plugin
    ADD CONSTRAINT platform_plugin_code_key UNIQUE (code);


--
-- Name: platform_plugin platform_plugin_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_plugin
    ADD CONSTRAINT platform_plugin_name_key UNIQUE (name);


--
-- Name: platform_plugin platform_plugin_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_plugin
    ADD CONSTRAINT platform_plugin_pkey PRIMARY KEY (id);


--
-- Name: platform_refund platform_refund_order_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_order_id_key UNIQUE (order_id);


--
-- Name: platform_refund platform_refund_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_pkey PRIMARY KEY (id);


--
-- Name: platform_refund platform_refund_refund_no_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_refund_no_key UNIQUE (refund_no);


--
-- Name: platform_tenant platform_tenant_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant
    ADD CONSTRAINT platform_tenant_code_key UNIQUE (code);


--
-- Name: platform_tenant platform_tenant_name_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant
    ADD CONSTRAINT platform_tenant_name_key UNIQUE (name);


--
-- Name: platform_tenant platform_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant
    ADD CONSTRAINT platform_tenant_pkey PRIMARY KEY (id);


--
-- Name: platform_tenant_plugin platform_tenant_plugin_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant_plugin
    ADD CONSTRAINT platform_tenant_plugin_pkey PRIMARY KEY (id);


--
-- Name: platform_user_tenant platform_user_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_user_tenant
    ADD CONSTRAINT platform_user_tenant_pkey PRIMARY KEY (id);


--
-- Name: sys_dept sys_dept_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dept
    ADD CONSTRAINT sys_dept_pkey PRIMARY KEY (id);


--
-- Name: sys_dept sys_dept_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dept
    ADD CONSTRAINT sys_dept_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: sys_dict_data sys_dict_data_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_data
    ADD CONSTRAINT sys_dict_data_pkey PRIMARY KEY (id);


--
-- Name: sys_dict_type sys_dict_type_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_type
    ADD CONSTRAINT sys_dict_type_pkey PRIMARY KEY (id);


--
-- Name: sys_dict_type sys_dict_type_tenant_id_dict_type_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_type
    ADD CONSTRAINT sys_dict_type_tenant_id_dict_type_key UNIQUE (tenant_id, dict_type);


--
-- Name: sys_login_log sys_login_log_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log
    ADD CONSTRAINT sys_login_log_pkey PRIMARY KEY (id);


--
-- Name: sys_notice sys_notice_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice
    ADD CONSTRAINT sys_notice_pkey PRIMARY KEY (id);


--
-- Name: sys_operation_log sys_operation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log
    ADD CONSTRAINT sys_operation_log_pkey PRIMARY KEY (id);


--
-- Name: sys_param sys_param_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_param
    ADD CONSTRAINT sys_param_pkey PRIMARY KEY (id);


--
-- Name: sys_position sys_position_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position
    ADD CONSTRAINT sys_position_pkey PRIMARY KEY (id);


--
-- Name: sys_role_depts sys_role_depts_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_depts
    ADD CONSTRAINT sys_role_depts_pkey PRIMARY KEY (role_id, dept_id);


--
-- Name: sys_role_menus sys_role_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_menus
    ADD CONSTRAINT sys_role_menus_pkey PRIMARY KEY (role_id, menu_id);


--
-- Name: sys_role sys_role_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role
    ADD CONSTRAINT sys_role_pkey PRIMARY KEY (id);


--
-- Name: sys_role sys_role_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role
    ADD CONSTRAINT sys_role_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: sys_ticket sys_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_pkey PRIMARY KEY (id);


--
-- Name: sys_user sys_user_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_pkey PRIMARY KEY (id);


--
-- Name: sys_user_positions sys_user_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_positions
    ADD CONSTRAINT sys_user_positions_pkey PRIMARY KEY (user_id, position_id);


--
-- Name: sys_user_roles sys_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_roles
    ADD CONSTRAINT sys_user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: sys_user sys_user_tenant_id_username_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_tenant_id_username_key UNIQUE (tenant_id, username);


--
-- Name: task_job task_job_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_job
    ADD CONSTRAINT task_job_pkey PRIMARY KEY (id);


--
-- Name: task_node task_node_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_pkey PRIMARY KEY (id);


--
-- Name: task_node task_node_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: task_workflow_node_type task_workflow_node_type_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_pkey PRIMARY KEY (id);


--
-- Name: task_workflow_node_type task_workflow_node_type_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: task_workflow task_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT task_workflow_pkey PRIMARY KEY (id);


--
-- Name: sys_dict_data uq_dict_data_value; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_data
    ADD CONSTRAINT uq_dict_data_value UNIQUE (tenant_id, dict_type_id, dict_value);


--
-- Name: platform_package_menu uq_package_menu; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_menu
    ADD CONSTRAINT uq_package_menu UNIQUE (package_id, menu_id);


--
-- Name: platform_package_plugin uq_package_plugin; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_plugin
    ADD CONSTRAINT uq_package_plugin UNIQUE (package_id, plugin_id);


--
-- Name: task_workflow uq_task_workflow_code; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT uq_task_workflow_code UNIQUE (tenant_id, code);


--
-- Name: platform_tenant_plugin uq_tenant_plugin; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant_plugin
    ADD CONSTRAINT uq_tenant_plugin UNIQUE (tenant_id, plugin_id);


--
-- Name: sys_notice_read uq_user_notice_read; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice_read
    ADD CONSTRAINT uq_user_notice_read PRIMARY KEY (user_id, notice_id);


--
-- Name: platform_user_tenant uq_user_tenant; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_user_tenant
    ADD CONSTRAINT uq_user_tenant UNIQUE (user_id, tenant_id);


--
-- Name: ix_apscheduler_jobs_next_run_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_apscheduler_jobs_next_run_time ON public.apscheduler_jobs USING btree (next_run_time);


--
-- Name: ix_example_demo_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_created_id ON public.example_demo USING btree (created_id);


--
-- Name: ix_example_demo_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_created_time ON public.example_demo USING btree (created_time);


--
-- Name: ix_example_demo_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_deleted_id ON public.example_demo USING btree (deleted_id);


--
-- Name: ix_example_demo_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_deleted_time ON public.example_demo USING btree (deleted_time);


--
-- Name: ix_example_demo_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_id ON public.example_demo USING btree (id);


--
-- Name: ix_example_demo_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_is_deleted ON public.example_demo USING btree (is_deleted);


--
-- Name: ix_example_demo_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_status ON public.example_demo USING btree (status);


--
-- Name: ix_example_demo_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_tenant_id ON public.example_demo USING btree (tenant_id);


--
-- Name: ix_example_demo_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_updated_id ON public.example_demo USING btree (updated_id);


--
-- Name: ix_example_demo_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_example_demo_updated_time ON public.example_demo USING btree (updated_time);


--
-- Name: ix_example_demo_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_example_demo_uuid ON public.example_demo USING btree (uuid);


--
-- Name: ix_gen_table_column_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_created_id ON public.gen_table_column USING btree (created_id);


--
-- Name: ix_gen_table_column_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_created_time ON public.gen_table_column USING btree (created_time);


--
-- Name: ix_gen_table_column_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_deleted_id ON public.gen_table_column USING btree (deleted_id);


--
-- Name: ix_gen_table_column_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_deleted_time ON public.gen_table_column USING btree (deleted_time);


--
-- Name: ix_gen_table_column_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_id ON public.gen_table_column USING btree (id);


--
-- Name: ix_gen_table_column_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_is_deleted ON public.gen_table_column USING btree (is_deleted);


--
-- Name: ix_gen_table_column_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_status ON public.gen_table_column USING btree (status);


--
-- Name: ix_gen_table_column_table_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_table_id ON public.gen_table_column USING btree (table_id);


--
-- Name: ix_gen_table_column_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_tenant_id ON public.gen_table_column USING btree (tenant_id);


--
-- Name: ix_gen_table_column_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_updated_id ON public.gen_table_column USING btree (updated_id);


--
-- Name: ix_gen_table_column_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_column_updated_time ON public.gen_table_column USING btree (updated_time);


--
-- Name: ix_gen_table_column_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_gen_table_column_uuid ON public.gen_table_column USING btree (uuid);


--
-- Name: ix_gen_table_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_created_id ON public.gen_table USING btree (created_id);


--
-- Name: ix_gen_table_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_created_time ON public.gen_table USING btree (created_time);


--
-- Name: ix_gen_table_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_deleted_id ON public.gen_table USING btree (deleted_id);


--
-- Name: ix_gen_table_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_deleted_time ON public.gen_table USING btree (deleted_time);


--
-- Name: ix_gen_table_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_id ON public.gen_table USING btree (id);


--
-- Name: ix_gen_table_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_is_deleted ON public.gen_table USING btree (is_deleted);


--
-- Name: ix_gen_table_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_status ON public.gen_table USING btree (status);


--
-- Name: ix_gen_table_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_tenant_id ON public.gen_table USING btree (tenant_id);


--
-- Name: ix_gen_table_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_updated_id ON public.gen_table USING btree (updated_id);


--
-- Name: ix_gen_table_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_gen_table_updated_time ON public.gen_table USING btree (updated_time);


--
-- Name: ix_gen_table_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_gen_table_uuid ON public.gen_table USING btree (uuid);


--
-- Name: ix_platform_email_config_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_created_time ON public.platform_email_config USING btree (created_time);


--
-- Name: ix_platform_email_config_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_deleted_time ON public.platform_email_config USING btree (deleted_time);


--
-- Name: ix_platform_email_config_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_id ON public.platform_email_config USING btree (id);


--
-- Name: ix_platform_email_config_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_is_deleted ON public.platform_email_config USING btree (is_deleted);


--
-- Name: ix_platform_email_config_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_status ON public.platform_email_config USING btree (status);


--
-- Name: ix_platform_email_config_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_config_updated_time ON public.platform_email_config USING btree (updated_time);


--
-- Name: ix_platform_email_config_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_email_config_uuid ON public.platform_email_config USING btree (uuid);


--
-- Name: ix_platform_email_log_config_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_config_id ON public.platform_email_log USING btree (config_id);


--
-- Name: ix_platform_email_log_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_created_time ON public.platform_email_log USING btree (created_time);


--
-- Name: ix_platform_email_log_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_deleted_time ON public.platform_email_log USING btree (deleted_time);


--
-- Name: ix_platform_email_log_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_id ON public.platform_email_log USING btree (id);


--
-- Name: ix_platform_email_log_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_is_deleted ON public.platform_email_log USING btree (is_deleted);


--
-- Name: ix_platform_email_log_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_status ON public.platform_email_log USING btree (status);


--
-- Name: ix_platform_email_log_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_tenant_id ON public.platform_email_log USING btree (tenant_id);


--
-- Name: ix_platform_email_log_to_email; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_to_email ON public.platform_email_log USING btree (to_email);


--
-- Name: ix_platform_email_log_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_log_updated_time ON public.platform_email_log USING btree (updated_time);


--
-- Name: ix_platform_email_log_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_email_log_uuid ON public.platform_email_log USING btree (uuid);


--
-- Name: ix_platform_email_template_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_created_time ON public.platform_email_template USING btree (created_time);


--
-- Name: ix_platform_email_template_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_deleted_time ON public.platform_email_template USING btree (deleted_time);


--
-- Name: ix_platform_email_template_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_id ON public.platform_email_template USING btree (id);


--
-- Name: ix_platform_email_template_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_is_deleted ON public.platform_email_template USING btree (is_deleted);


--
-- Name: ix_platform_email_template_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_status ON public.platform_email_template USING btree (status);


--
-- Name: ix_platform_email_template_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_email_template_updated_time ON public.platform_email_template USING btree (updated_time);


--
-- Name: ix_platform_email_template_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_email_template_uuid ON public.platform_email_template USING btree (uuid);


--
-- Name: ix_platform_invoice_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_created_time ON public.platform_invoice USING btree (created_time);


--
-- Name: ix_platform_invoice_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_deleted_time ON public.platform_invoice USING btree (deleted_time);


--
-- Name: ix_platform_invoice_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_id ON public.platform_invoice USING btree (id);


--
-- Name: ix_platform_invoice_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_is_deleted ON public.platform_invoice USING btree (is_deleted);


--
-- Name: ix_platform_invoice_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_status ON public.platform_invoice USING btree (status);


--
-- Name: ix_platform_invoice_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_tenant_id ON public.platform_invoice USING btree (tenant_id);


--
-- Name: ix_platform_invoice_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_invoice_updated_time ON public.platform_invoice USING btree (updated_time);


--
-- Name: ix_platform_invoice_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_invoice_uuid ON public.platform_invoice USING btree (uuid);


--
-- Name: ix_platform_menu_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_created_time ON public.platform_menu USING btree (created_time);


--
-- Name: ix_platform_menu_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_deleted_time ON public.platform_menu USING btree (deleted_time);


--
-- Name: ix_platform_menu_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_id ON public.platform_menu USING btree (id);


--
-- Name: ix_platform_menu_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_is_deleted ON public.platform_menu USING btree (is_deleted);


--
-- Name: ix_platform_menu_parent_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_parent_id ON public.platform_menu USING btree (parent_id);


--
-- Name: ix_platform_menu_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_status ON public.platform_menu USING btree (status);


--
-- Name: ix_platform_menu_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_menu_updated_time ON public.platform_menu USING btree (updated_time);


--
-- Name: ix_platform_menu_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_menu_uuid ON public.platform_menu USING btree (uuid);


--
-- Name: ix_platform_order_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_created_time ON public.platform_order USING btree (created_time);


--
-- Name: ix_platform_order_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_deleted_time ON public.platform_order USING btree (deleted_time);


--
-- Name: ix_platform_order_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_id ON public.platform_order USING btree (id);


--
-- Name: ix_platform_order_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_is_deleted ON public.platform_order USING btree (is_deleted);


--
-- Name: ix_platform_order_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_status ON public.platform_order USING btree (status);


--
-- Name: ix_platform_order_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_tenant_id ON public.platform_order USING btree (tenant_id);


--
-- Name: ix_platform_order_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_order_updated_time ON public.platform_order USING btree (updated_time);


--
-- Name: ix_platform_order_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_order_uuid ON public.platform_order USING btree (uuid);


--
-- Name: ix_platform_package_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_created_time ON public.platform_package USING btree (created_time);


--
-- Name: ix_platform_package_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_deleted_time ON public.platform_package USING btree (deleted_time);


--
-- Name: ix_platform_package_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_id ON public.platform_package USING btree (id);


--
-- Name: ix_platform_package_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_is_deleted ON public.platform_package USING btree (is_deleted);


--
-- Name: ix_platform_package_menu_menu_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_menu_menu_id ON public.platform_package_menu USING btree (menu_id);


--
-- Name: ix_platform_package_menu_package_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_menu_package_id ON public.platform_package_menu USING btree (package_id);


--
-- Name: ix_platform_package_plugin_package_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_plugin_package_id ON public.platform_package_plugin USING btree (package_id);


--
-- Name: ix_platform_package_plugin_plugin_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_plugin_plugin_id ON public.platform_package_plugin USING btree (plugin_id);


--
-- Name: ix_platform_package_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_status ON public.platform_package USING btree (status);


--
-- Name: ix_platform_package_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_package_updated_time ON public.platform_package USING btree (updated_time);


--
-- Name: ix_platform_package_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_package_uuid ON public.platform_package USING btree (uuid);


--
-- Name: ix_platform_payment_record_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_created_time ON public.platform_payment_record USING btree (created_time);


--
-- Name: ix_platform_payment_record_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_deleted_time ON public.platform_payment_record USING btree (deleted_time);


--
-- Name: ix_platform_payment_record_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_id ON public.platform_payment_record USING btree (id);


--
-- Name: ix_platform_payment_record_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_is_deleted ON public.platform_payment_record USING btree (is_deleted);


--
-- Name: ix_platform_payment_record_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_status ON public.platform_payment_record USING btree (status);


--
-- Name: ix_platform_payment_record_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_tenant_id ON public.platform_payment_record USING btree (tenant_id);


--
-- Name: ix_platform_payment_record_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_payment_record_updated_time ON public.platform_payment_record USING btree (updated_time);


--
-- Name: ix_platform_payment_record_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_payment_record_uuid ON public.platform_payment_record USING btree (uuid);


--
-- Name: ix_platform_plugin_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_created_time ON public.platform_plugin USING btree (created_time);


--
-- Name: ix_platform_plugin_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_deleted_time ON public.platform_plugin USING btree (deleted_time);


--
-- Name: ix_platform_plugin_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_id ON public.platform_plugin USING btree (id);


--
-- Name: ix_platform_plugin_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_is_deleted ON public.platform_plugin USING btree (is_deleted);


--
-- Name: ix_platform_plugin_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_status ON public.platform_plugin USING btree (status);


--
-- Name: ix_platform_plugin_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_plugin_updated_time ON public.platform_plugin USING btree (updated_time);


--
-- Name: ix_platform_plugin_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_plugin_uuid ON public.platform_plugin USING btree (uuid);


--
-- Name: ix_platform_refund_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_created_time ON public.platform_refund USING btree (created_time);


--
-- Name: ix_platform_refund_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_deleted_time ON public.platform_refund USING btree (deleted_time);


--
-- Name: ix_platform_refund_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_id ON public.platform_refund USING btree (id);


--
-- Name: ix_platform_refund_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_is_deleted ON public.platform_refund USING btree (is_deleted);


--
-- Name: ix_platform_refund_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_status ON public.platform_refund USING btree (status);


--
-- Name: ix_platform_refund_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_tenant_id ON public.platform_refund USING btree (tenant_id);


--
-- Name: ix_platform_refund_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_refund_updated_time ON public.platform_refund USING btree (updated_time);


--
-- Name: ix_platform_refund_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_refund_uuid ON public.platform_refund USING btree (uuid);


--
-- Name: ix_platform_tenant_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_created_time ON public.platform_tenant USING btree (created_time);


--
-- Name: ix_platform_tenant_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_deleted_time ON public.platform_tenant USING btree (deleted_time);


--
-- Name: ix_platform_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_id ON public.platform_tenant USING btree (id);


--
-- Name: ix_platform_tenant_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_is_deleted ON public.platform_tenant USING btree (is_deleted);


--
-- Name: ix_platform_tenant_package_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_package_id ON public.platform_tenant USING btree (package_id);


--
-- Name: ix_platform_tenant_plugin_plugin_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_plugin_plugin_id ON public.platform_tenant_plugin USING btree (plugin_id);


--
-- Name: ix_platform_tenant_plugin_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_plugin_tenant_id ON public.platform_tenant_plugin USING btree (tenant_id);


--
-- Name: ix_platform_tenant_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_status ON public.platform_tenant USING btree (status);


--
-- Name: ix_platform_tenant_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_tenant_updated_time ON public.platform_tenant USING btree (updated_time);


--
-- Name: ix_platform_tenant_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_platform_tenant_uuid ON public.platform_tenant USING btree (uuid);


--
-- Name: ix_platform_user_tenant_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_user_tenant_tenant_id ON public.platform_user_tenant USING btree (tenant_id);


--
-- Name: ix_platform_user_tenant_user_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_platform_user_tenant_user_id ON public.platform_user_tenant USING btree (user_id);


--
-- Name: ix_sys_dept_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_created_time ON public.sys_dept USING btree (created_time);


--
-- Name: ix_sys_dept_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_deleted_time ON public.sys_dept USING btree (deleted_time);


--
-- Name: ix_sys_dept_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_id ON public.sys_dept USING btree (id);


--
-- Name: ix_sys_dept_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_is_deleted ON public.sys_dept USING btree (is_deleted);


--
-- Name: ix_sys_dept_parent_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_parent_id ON public.sys_dept USING btree (parent_id);


--
-- Name: ix_sys_dept_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_status ON public.sys_dept USING btree (status);


--
-- Name: ix_sys_dept_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_tenant_id ON public.sys_dept USING btree (tenant_id);


--
-- Name: ix_sys_dept_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dept_updated_time ON public.sys_dept USING btree (updated_time);


--
-- Name: ix_sys_dept_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_dept_uuid ON public.sys_dept USING btree (uuid);


--
-- Name: ix_sys_dict_data_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_created_time ON public.sys_dict_data USING btree (created_time);


--
-- Name: ix_sys_dict_data_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_deleted_time ON public.sys_dict_data USING btree (deleted_time);


--
-- Name: ix_sys_dict_data_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_id ON public.sys_dict_data USING btree (id);


--
-- Name: ix_sys_dict_data_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_is_deleted ON public.sys_dict_data USING btree (is_deleted);


--
-- Name: ix_sys_dict_data_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_status ON public.sys_dict_data USING btree (status);


--
-- Name: ix_sys_dict_data_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_tenant_id ON public.sys_dict_data USING btree (tenant_id);


--
-- Name: ix_sys_dict_data_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_data_updated_time ON public.sys_dict_data USING btree (updated_time);


--
-- Name: ix_sys_dict_data_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_dict_data_uuid ON public.sys_dict_data USING btree (uuid);


--
-- Name: ix_sys_dict_type_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_created_time ON public.sys_dict_type USING btree (created_time);


--
-- Name: ix_sys_dict_type_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_deleted_time ON public.sys_dict_type USING btree (deleted_time);


--
-- Name: ix_sys_dict_type_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_id ON public.sys_dict_type USING btree (id);


--
-- Name: ix_sys_dict_type_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_is_deleted ON public.sys_dict_type USING btree (is_deleted);


--
-- Name: ix_sys_dict_type_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_status ON public.sys_dict_type USING btree (status);


--
-- Name: ix_sys_dict_type_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_tenant_id ON public.sys_dict_type USING btree (tenant_id);


--
-- Name: ix_sys_dict_type_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_dict_type_updated_time ON public.sys_dict_type USING btree (updated_time);


--
-- Name: ix_sys_dict_type_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_dict_type_uuid ON public.sys_dict_type USING btree (uuid);


--
-- Name: ix_sys_login_log_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_created_id ON public.sys_login_log USING btree (created_id);


--
-- Name: ix_sys_login_log_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_created_time ON public.sys_login_log USING btree (created_time);


--
-- Name: ix_sys_login_log_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_deleted_id ON public.sys_login_log USING btree (deleted_id);


--
-- Name: ix_sys_login_log_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_deleted_time ON public.sys_login_log USING btree (deleted_time);


--
-- Name: ix_sys_login_log_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_id ON public.sys_login_log USING btree (id);


--
-- Name: ix_sys_login_log_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_is_deleted ON public.sys_login_log USING btree (is_deleted);


--
-- Name: ix_sys_login_log_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_tenant_id ON public.sys_login_log USING btree (tenant_id);


--
-- Name: ix_sys_login_log_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_updated_id ON public.sys_login_log USING btree (updated_id);


--
-- Name: ix_sys_login_log_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_login_log_updated_time ON public.sys_login_log USING btree (updated_time);


--
-- Name: ix_sys_login_log_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_login_log_uuid ON public.sys_login_log USING btree (uuid);


--
-- Name: ix_sys_notice_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_created_id ON public.sys_notice USING btree (created_id);


--
-- Name: ix_sys_notice_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_created_time ON public.sys_notice USING btree (created_time);


--
-- Name: ix_sys_notice_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_deleted_id ON public.sys_notice USING btree (deleted_id);


--
-- Name: ix_sys_notice_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_deleted_time ON public.sys_notice USING btree (deleted_time);


--
-- Name: ix_sys_notice_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_id ON public.sys_notice USING btree (id);


--
-- Name: ix_sys_notice_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_is_deleted ON public.sys_notice USING btree (is_deleted);


--
-- Name: ix_sys_notice_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_status ON public.sys_notice USING btree (status);


--
-- Name: ix_sys_notice_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_tenant_id ON public.sys_notice USING btree (tenant_id);


--
-- Name: ix_sys_notice_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_updated_id ON public.sys_notice USING btree (updated_id);


--
-- Name: ix_sys_notice_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_notice_updated_time ON public.sys_notice USING btree (updated_time);


--
-- Name: ix_sys_notice_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_notice_uuid ON public.sys_notice USING btree (uuid);


--
-- Name: ix_sys_operation_log_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_created_id ON public.sys_operation_log USING btree (created_id);


--
-- Name: ix_sys_operation_log_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_created_time ON public.sys_operation_log USING btree (created_time);


--
-- Name: ix_sys_operation_log_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_deleted_id ON public.sys_operation_log USING btree (deleted_id);


--
-- Name: ix_sys_operation_log_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_deleted_time ON public.sys_operation_log USING btree (deleted_time);


--
-- Name: ix_sys_operation_log_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_id ON public.sys_operation_log USING btree (id);


--
-- Name: ix_sys_operation_log_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_is_deleted ON public.sys_operation_log USING btree (is_deleted);


--
-- Name: ix_sys_operation_log_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_status ON public.sys_operation_log USING btree (status);


--
-- Name: ix_sys_operation_log_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_tenant_id ON public.sys_operation_log USING btree (tenant_id);


--
-- Name: ix_sys_operation_log_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_updated_id ON public.sys_operation_log USING btree (updated_id);


--
-- Name: ix_sys_operation_log_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_operation_log_updated_time ON public.sys_operation_log USING btree (updated_time);


--
-- Name: ix_sys_operation_log_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_operation_log_uuid ON public.sys_operation_log USING btree (uuid);


--
-- Name: ix_sys_param_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_created_time ON public.sys_param USING btree (created_time);


--
-- Name: ix_sys_param_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_deleted_time ON public.sys_param USING btree (deleted_time);


--
-- Name: ix_sys_param_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_id ON public.sys_param USING btree (id);


--
-- Name: ix_sys_param_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_is_deleted ON public.sys_param USING btree (is_deleted);


--
-- Name: ix_sys_param_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_status ON public.sys_param USING btree (status);


--
-- Name: ix_sys_param_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_tenant_id ON public.sys_param USING btree (tenant_id);


--
-- Name: ix_sys_param_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_param_updated_time ON public.sys_param USING btree (updated_time);


--
-- Name: ix_sys_param_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_param_uuid ON public.sys_param USING btree (uuid);


--
-- Name: ix_sys_position_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_created_id ON public.sys_position USING btree (created_id);


--
-- Name: ix_sys_position_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_created_time ON public.sys_position USING btree (created_time);


--
-- Name: ix_sys_position_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_deleted_id ON public.sys_position USING btree (deleted_id);


--
-- Name: ix_sys_position_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_deleted_time ON public.sys_position USING btree (deleted_time);


--
-- Name: ix_sys_position_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_id ON public.sys_position USING btree (id);


--
-- Name: ix_sys_position_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_is_deleted ON public.sys_position USING btree (is_deleted);


--
-- Name: ix_sys_position_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_status ON public.sys_position USING btree (status);


--
-- Name: ix_sys_position_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_tenant_id ON public.sys_position USING btree (tenant_id);


--
-- Name: ix_sys_position_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_updated_id ON public.sys_position USING btree (updated_id);


--
-- Name: ix_sys_position_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_position_updated_time ON public.sys_position USING btree (updated_time);


--
-- Name: ix_sys_position_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_position_uuid ON public.sys_position USING btree (uuid);


--
-- Name: ix_sys_role_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_created_time ON public.sys_role USING btree (created_time);


--
-- Name: ix_sys_role_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_deleted_time ON public.sys_role USING btree (deleted_time);


--
-- Name: ix_sys_role_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_id ON public.sys_role USING btree (id);


--
-- Name: ix_sys_role_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_is_deleted ON public.sys_role USING btree (is_deleted);


--
-- Name: ix_sys_role_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_status ON public.sys_role USING btree (status);


--
-- Name: ix_sys_role_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_tenant_id ON public.sys_role USING btree (tenant_id);


--
-- Name: ix_sys_role_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_role_updated_time ON public.sys_role USING btree (updated_time);


--
-- Name: ix_sys_role_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_role_uuid ON public.sys_role USING btree (uuid);


--
-- Name: ix_sys_ticket_assigned_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_assigned_id ON public.sys_ticket USING btree (assigned_id);


--
-- Name: ix_sys_ticket_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_created_id ON public.sys_ticket USING btree (created_id);


--
-- Name: ix_sys_ticket_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_created_time ON public.sys_ticket USING btree (created_time);


--
-- Name: ix_sys_ticket_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_deleted_id ON public.sys_ticket USING btree (deleted_id);


--
-- Name: ix_sys_ticket_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_deleted_time ON public.sys_ticket USING btree (deleted_time);


--
-- Name: ix_sys_ticket_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_id ON public.sys_ticket USING btree (id);


--
-- Name: ix_sys_ticket_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_is_deleted ON public.sys_ticket USING btree (is_deleted);


--
-- Name: ix_sys_ticket_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_status ON public.sys_ticket USING btree (status);


--
-- Name: ix_sys_ticket_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_tenant_id ON public.sys_ticket USING btree (tenant_id);


--
-- Name: ix_sys_ticket_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_updated_id ON public.sys_ticket USING btree (updated_id);


--
-- Name: ix_sys_ticket_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_ticket_updated_time ON public.sys_ticket USING btree (updated_time);


--
-- Name: ix_sys_ticket_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_ticket_uuid ON public.sys_ticket USING btree (uuid);


--
-- Name: ix_sys_user_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_created_id ON public.sys_user USING btree (created_id);


--
-- Name: ix_sys_user_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_created_time ON public.sys_user USING btree (created_time);


--
-- Name: ix_sys_user_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_deleted_id ON public.sys_user USING btree (deleted_id);


--
-- Name: ix_sys_user_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_deleted_time ON public.sys_user USING btree (deleted_time);


--
-- Name: ix_sys_user_dept_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_dept_id ON public.sys_user USING btree (dept_id);


--
-- Name: ix_sys_user_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_id ON public.sys_user USING btree (id);


--
-- Name: ix_sys_user_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_is_deleted ON public.sys_user USING btree (is_deleted);


--
-- Name: ix_sys_user_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_status ON public.sys_user USING btree (status);


--
-- Name: ix_sys_user_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_tenant_id ON public.sys_user USING btree (tenant_id);


--
-- Name: ix_sys_user_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_updated_id ON public.sys_user USING btree (updated_id);


--
-- Name: ix_sys_user_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_sys_user_updated_time ON public.sys_user USING btree (updated_time);


--
-- Name: ix_sys_user_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_sys_user_uuid ON public.sys_user USING btree (uuid);


--
-- Name: ix_task_job_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_created_time ON public.task_job USING btree (created_time);


--
-- Name: ix_task_job_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_deleted_time ON public.task_job USING btree (deleted_time);


--
-- Name: ix_task_job_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_id ON public.task_job USING btree (id);


--
-- Name: ix_task_job_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_is_deleted ON public.task_job USING btree (is_deleted);


--
-- Name: ix_task_job_job_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_job_id ON public.task_job USING btree (job_id);


--
-- Name: ix_task_job_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_tenant_id ON public.task_job USING btree (tenant_id);


--
-- Name: ix_task_job_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_job_updated_time ON public.task_job USING btree (updated_time);


--
-- Name: ix_task_job_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_task_job_uuid ON public.task_job USING btree (uuid);


--
-- Name: ix_task_node_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_created_id ON public.task_node USING btree (created_id);


--
-- Name: ix_task_node_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_created_time ON public.task_node USING btree (created_time);


--
-- Name: ix_task_node_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_deleted_id ON public.task_node USING btree (deleted_id);


--
-- Name: ix_task_node_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_deleted_time ON public.task_node USING btree (deleted_time);


--
-- Name: ix_task_node_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_id ON public.task_node USING btree (id);


--
-- Name: ix_task_node_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_is_deleted ON public.task_node USING btree (is_deleted);


--
-- Name: ix_task_node_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_status ON public.task_node USING btree (status);


--
-- Name: ix_task_node_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_tenant_id ON public.task_node USING btree (tenant_id);


--
-- Name: ix_task_node_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_updated_id ON public.task_node USING btree (updated_id);


--
-- Name: ix_task_node_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_node_updated_time ON public.task_node USING btree (updated_time);


--
-- Name: ix_task_node_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_task_node_uuid ON public.task_node USING btree (uuid);


--
-- Name: ix_task_workflow_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_created_id ON public.task_workflow USING btree (created_id);


--
-- Name: ix_task_workflow_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_created_time ON public.task_workflow USING btree (created_time);


--
-- Name: ix_task_workflow_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_deleted_id ON public.task_workflow USING btree (deleted_id);


--
-- Name: ix_task_workflow_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_deleted_time ON public.task_workflow USING btree (deleted_time);


--
-- Name: ix_task_workflow_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_id ON public.task_workflow USING btree (id);


--
-- Name: ix_task_workflow_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_is_deleted ON public.task_workflow USING btree (is_deleted);


--
-- Name: ix_task_workflow_node_type_created_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_created_id ON public.task_workflow_node_type USING btree (created_id);


--
-- Name: ix_task_workflow_node_type_created_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_created_time ON public.task_workflow_node_type USING btree (created_time);


--
-- Name: ix_task_workflow_node_type_deleted_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_deleted_id ON public.task_workflow_node_type USING btree (deleted_id);


--
-- Name: ix_task_workflow_node_type_deleted_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_deleted_time ON public.task_workflow_node_type USING btree (deleted_time);


--
-- Name: ix_task_workflow_node_type_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_id ON public.task_workflow_node_type USING btree (id);


--
-- Name: ix_task_workflow_node_type_is_deleted; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_is_deleted ON public.task_workflow_node_type USING btree (is_deleted);


--
-- Name: ix_task_workflow_node_type_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_status ON public.task_workflow_node_type USING btree (status);


--
-- Name: ix_task_workflow_node_type_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_tenant_id ON public.task_workflow_node_type USING btree (tenant_id);


--
-- Name: ix_task_workflow_node_type_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_updated_id ON public.task_workflow_node_type USING btree (updated_id);


--
-- Name: ix_task_workflow_node_type_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_node_type_updated_time ON public.task_workflow_node_type USING btree (updated_time);


--
-- Name: ix_task_workflow_node_type_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_task_workflow_node_type_uuid ON public.task_workflow_node_type USING btree (uuid);


--
-- Name: ix_task_workflow_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_status ON public.task_workflow USING btree (status);


--
-- Name: ix_task_workflow_tenant_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_tenant_id ON public.task_workflow USING btree (tenant_id);


--
-- Name: ix_task_workflow_updated_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_updated_id ON public.task_workflow USING btree (updated_id);


--
-- Name: ix_task_workflow_updated_time; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX ix_task_workflow_updated_time ON public.task_workflow USING btree (updated_time);


--
-- Name: ix_task_workflow_uuid; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX ix_task_workflow_uuid ON public.task_workflow USING btree (uuid);


--
-- Name: example_demo example_demo_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo
    ADD CONSTRAINT example_demo_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: example_demo example_demo_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo
    ADD CONSTRAINT example_demo_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: example_demo example_demo_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo
    ADD CONSTRAINT example_demo_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: example_demo example_demo_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.example_demo
    ADD CONSTRAINT example_demo_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table_column gen_table_column_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table_column gen_table_column_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table_column gen_table_column_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.gen_table(id) ON DELETE CASCADE;


--
-- Name: gen_table_column gen_table_column_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gen_table_column gen_table_column_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table_column
    ADD CONSTRAINT gen_table_column_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table gen_table_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table
    ADD CONSTRAINT gen_table_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table gen_table_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table
    ADD CONSTRAINT gen_table_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gen_table gen_table_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table
    ADD CONSTRAINT gen_table_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gen_table gen_table_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.gen_table
    ADD CONSTRAINT gen_table_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: platform_email_log platform_email_log_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_email_log
    ADD CONSTRAINT platform_email_log_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.platform_email_config(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: platform_invoice platform_invoice_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice
    ADD CONSTRAINT platform_invoice_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.platform_order(id);


--
-- Name: platform_invoice platform_invoice_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_invoice
    ADD CONSTRAINT platform_invoice_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: platform_menu platform_menu_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_menu
    ADD CONSTRAINT platform_menu_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.platform_menu(id) ON DELETE SET NULL;


--
-- Name: platform_order platform_order_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order
    ADD CONSTRAINT platform_order_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.platform_package(id);


--
-- Name: platform_order platform_order_plugin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order
    ADD CONSTRAINT platform_order_plugin_id_fkey FOREIGN KEY (plugin_id) REFERENCES public.platform_plugin(id);


--
-- Name: platform_order platform_order_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_order
    ADD CONSTRAINT platform_order_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: platform_package_menu platform_package_menu_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_menu
    ADD CONSTRAINT platform_package_menu_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.platform_menu(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_package_menu platform_package_menu_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_menu
    ADD CONSTRAINT platform_package_menu_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.platform_package(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_package_plugin platform_package_plugin_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_plugin
    ADD CONSTRAINT platform_package_plugin_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.platform_package(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_package_plugin platform_package_plugin_plugin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_package_plugin
    ADD CONSTRAINT platform_package_plugin_plugin_id_fkey FOREIGN KEY (plugin_id) REFERENCES public.platform_plugin(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_payment_record platform_payment_record_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_payment_record
    ADD CONSTRAINT platform_payment_record_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.platform_order(id);


--
-- Name: platform_payment_record platform_payment_record_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_payment_record
    ADD CONSTRAINT platform_payment_record_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: platform_refund platform_refund_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.platform_order(id);


--
-- Name: platform_refund platform_refund_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.sys_user(id);


--
-- Name: platform_refund platform_refund_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_refund
    ADD CONSTRAINT platform_refund_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: platform_tenant platform_tenant_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant
    ADD CONSTRAINT platform_tenant_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.platform_package(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: platform_tenant_plugin platform_tenant_plugin_plugin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant_plugin
    ADD CONSTRAINT platform_tenant_plugin_plugin_id_fkey FOREIGN KEY (plugin_id) REFERENCES public.platform_plugin(id) ON DELETE CASCADE;


--
-- Name: platform_tenant_plugin platform_tenant_plugin_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_tenant_plugin
    ADD CONSTRAINT platform_tenant_plugin_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON DELETE CASCADE;


--
-- Name: platform_user_tenant platform_user_tenant_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_user_tenant
    ADD CONSTRAINT platform_user_tenant_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_user_tenant platform_user_tenant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.platform_user_tenant
    ADD CONSTRAINT platform_user_tenant_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_dept sys_dept_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dept
    ADD CONSTRAINT sys_dept_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.sys_dept(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_dept sys_dept_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dept
    ADD CONSTRAINT sys_dept_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_dict_data sys_dict_data_dict_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_data
    ADD CONSTRAINT sys_dict_data_dict_type_id_fkey FOREIGN KEY (dict_type_id) REFERENCES public.sys_dict_type(id) ON DELETE CASCADE;


--
-- Name: sys_dict_data sys_dict_data_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_data
    ADD CONSTRAINT sys_dict_data_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_dict_type sys_dict_type_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_dict_type
    ADD CONSTRAINT sys_dict_type_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_login_log sys_login_log_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log
    ADD CONSTRAINT sys_login_log_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_login_log sys_login_log_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log
    ADD CONSTRAINT sys_login_log_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_login_log sys_login_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log
    ADD CONSTRAINT sys_login_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_login_log sys_login_log_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_login_log
    ADD CONSTRAINT sys_login_log_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_notice sys_notice_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice
    ADD CONSTRAINT sys_notice_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_notice sys_notice_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice
    ADD CONSTRAINT sys_notice_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_notice_read sys_notice_read_notice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice_read
    ADD CONSTRAINT sys_notice_read_notice_id_fkey FOREIGN KEY (notice_id) REFERENCES public.sys_notice(id) ON DELETE CASCADE;


--
-- Name: sys_notice_read sys_notice_read_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice_read
    ADD CONSTRAINT sys_notice_read_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_user(id) ON DELETE CASCADE;


--
-- Name: sys_notice sys_notice_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice
    ADD CONSTRAINT sys_notice_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_notice sys_notice_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_notice
    ADD CONSTRAINT sys_notice_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_operation_log sys_operation_log_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log
    ADD CONSTRAINT sys_operation_log_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_operation_log sys_operation_log_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log
    ADD CONSTRAINT sys_operation_log_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_operation_log sys_operation_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log
    ADD CONSTRAINT sys_operation_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_operation_log sys_operation_log_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_operation_log
    ADD CONSTRAINT sys_operation_log_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_param sys_param_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_param
    ADD CONSTRAINT sys_param_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_position sys_position_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position
    ADD CONSTRAINT sys_position_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_position sys_position_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position
    ADD CONSTRAINT sys_position_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_position sys_position_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position
    ADD CONSTRAINT sys_position_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_position sys_position_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_position
    ADD CONSTRAINT sys_position_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_role_depts sys_role_depts_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_depts
    ADD CONSTRAINT sys_role_depts_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.sys_dept(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_role_depts sys_role_depts_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_depts
    ADD CONSTRAINT sys_role_depts_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.sys_role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_role_menus sys_role_menus_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_menus
    ADD CONSTRAINT sys_role_menus_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.platform_menu(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_role_menus sys_role_menus_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role_menus
    ADD CONSTRAINT sys_role_menus_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.sys_role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_role sys_role_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_role
    ADD CONSTRAINT sys_role_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_ticket sys_ticket_assigned_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_assigned_id_fkey FOREIGN KEY (assigned_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_ticket sys_ticket_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_ticket sys_ticket_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_ticket sys_ticket_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_ticket sys_ticket_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_ticket
    ADD CONSTRAINT sys_ticket_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_user sys_user_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_user sys_user_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_user sys_user_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.sys_dept(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sys_user_positions sys_user_positions_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_positions
    ADD CONSTRAINT sys_user_positions_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.sys_position(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_user_positions sys_user_positions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_positions
    ADD CONSTRAINT sys_user_positions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_user_roles sys_user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_roles
    ADD CONSTRAINT sys_user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.sys_role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_user_roles sys_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user_roles
    ADD CONSTRAINT sys_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sys_user sys_user_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sys_user sys_user_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sys_user
    ADD CONSTRAINT sys_user_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_job task_job_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_job
    ADD CONSTRAINT task_job_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task_node task_node_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_node task_node_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_node task_node_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task_node task_node_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_node
    ADD CONSTRAINT task_node_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow task_workflow_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT task_workflow_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow task_workflow_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT task_workflow_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow_node_type task_workflow_node_type_created_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_created_id_fkey FOREIGN KEY (created_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow_node_type task_workflow_node_type_deleted_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow_node_type task_workflow_node_type_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task_workflow_node_type task_workflow_node_type_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow_node_type
    ADD CONSTRAINT task_workflow_node_type_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_workflow task_workflow_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT task_workflow_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.platform_tenant(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task_workflow task_workflow_updated_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.task_workflow
    ADD CONSTRAINT task_workflow_updated_id_fkey FOREIGN KEY (updated_id) REFERENCES public.sys_user(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 9qExZeqqbdUYt6emtfQgYjzUgI8DjpcaY12XCXlE27m3yq2zeOHxmNos5PWNVpi

