export const createTestDB = `

    --  USER

    CREATE TABLE IF NOT EXISTS user_app (
        id character varying(256) NOT NULL,
        user_name character varying(256),
        street character varying(256),
        street_number character varying(256),
        zip_code character varying(5),
        city character varying(256),
        user_since timestamp without time zone,
        customer_since timestamp without time zone,
        name character varying(256),
        province_id integer,
        CONSTRAINT user_app_pkey PRIMARY KEY (id)
    );


    -- METER

    CREATE TABLE IF NOT EXISTS meter (
        id character varying(256) NOT NULL,
        user_app_id character varying(256),
        meter_type character varying(256),
        street character varying(256),
        street_number character varying(256),
        zip_code character varying(5),
        city character varying(256),
        status character varying(256),
        peer_id integer,
        contracted_power integer,
        province_id integer,
        meter_code character varying,
        CONSTRAINT meter_pkey PRIMARY KEY (id),
        CONSTRAINT fk_child_user_app_id FOREIGN KEY (user_app_id)
            REFERENCES user_app(id)
            ON UPDATE NO ACTION ON DELETE NO ACTION
    );


    --  ANSWER

    CREATE TABLE IF NOT EXISTS answer (
        id serial NOT NULL,
        answer_text character varying(256),
        CONSTRAINT answer_pkey PRIMARY KEY (id)
    );


    --  QUESTION

    CREATE TABLE IF NOT EXISTS question (
        id character varying(256) NOT NULL,
        question_category character varying(256),
        question_text character varying(256),
        CONSTRAINT question_pkey PRIMARY KEY (id)
    );


    --  SURVEY_ANSWER

    CREATE TABLE IF NOT EXISTS survey_answer (
        id serial NOT NULL,
        answer_text character varying(256),
        CONSTRAINT survey_answer_pkey PRIMARY KEY (id)
    );


    --  SURVEY_QUESTION

    CREATE TABLE IF NOT EXISTS survey_question (
        id character varying(256) NOT NULL,
        question_category character varying(256),
        question_text character varying(256),
        CONSTRAINT survey_question_pkey PRIMARY KEY (id)
    );


    -- SURVEY

    CREATE TABLE IF NOT EXISTS survey (
        id serial NOT NULL,
        user_app_id character varying(256),
        survey_question_id character varying(256),
        survey_answer_id integer,
        date_answered timestamp with time zone
    );


    -- QUESTIONNAIRE

    CREATE TABLE IF NOT EXISTS questionnaire (
        id serial NOT NULL,
        user_app_id character varying(256),
        meter_id character varying(256),
        question_id character varying(256),
        answer_id integer,
        date_answered timestamp with time zone,
        CONSTRAINT questionnaire_pkey PRIMARY KEY (id)
    );

`;
