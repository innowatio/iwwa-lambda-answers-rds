import {expect} from "chai";

import {handler} from "index";
import {
    getClient,
    insertQuestionnaire,
    insertQuestionnaireQuestion,
    insertQuestionnaireAnswer,
    insertSurvey,
    insertSurveyQuestion,
    insertSurveyAnswer
} from "services/db";
import {getEventFromObject, run} from "../mocks";
import {createTestDB} from "../../scripts/create-tables";


describe("`answers` on RDS", () => {

    const db = getClient();

    before(async () => {
        // create tables
        await db.query(createTestDB);

        // insert test user
        await db.query(
            `INSERT INTO user_app
                (id, user_name)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING`,
            "id-user-1", "test-user-1");

        // insert test meter
        await db.query(
            `INSERT INTO meter
                (id)
                VALUES ($1)
                ON CONFLICT DO NOTHING`,
            "my-meter-id-1");
    });

    afterEach(async () => {
        await db.query({
            text: `
                DELETE FROM questionnaire;
                DELETE FROM question;
                DELETE FROM answer;
                DELETE FROM survey;
                DELETE FROM survey_question;
                DELETE FROM survey_answer;`
        });
    });

    after(async () => {
        await db.query({
            text: `
                DELETE FROM user_app;
                DELETE FROM meter;`
        });
    });

    describe("on questionnaire answers", async () => {

        it("INSERT multiple questionnaires, questions and answers", async () => {
            const event = getEventFromObject({
                data: {
                    id: "1",
                    element:{
                        questionId: "question1",
                        type: "questionnaire",
                        category: "demographics",
                        userId: "id-user-1",
                        siteId: "my-meter-id-1",
                        visitId: "my-visit-1",
                        answers: [{
                            id: 1,
                            timestamp: "2016-01-01T11:22:33Z",
                            answer: "Buby",
                            question: {
                                text: "What's your name?",
                                category: "category1"
                            }
                        }, {
                            id: 2,
                            timestamp: "2016-01-01T11:22:55Z",
                            answer: "Ok",
                            question: {
                                text: "How you doing?",
                                category: "category2"
                            }
                        }]
                    }
                },
                type: "element inserted in collection answers"
            });

            await run(handler, event);

            const answers = await db.rows("SELECT * FROM answer ORDER BY answer_text");
            const answersNoId = answers.map(answer => {
                return {...answer, id: undefined};
            });
            expect(answersNoId).to.deep.equal([{
                id: undefined,
                answer_text: "Buby"
            }, {
                id: undefined,
                answer_text: "Ok"
            }]);

            const questions = await db.rows("SELECT * FROM question ORDER BY id");
            expect(questions).to.deep.equal([{
                id: "question1-1",
                question_category: "demographics",
                question_text: "What's your name?"
            }, {
                id: "question1-2",
                question_category: "demographics",
                question_text: "How you doing?"
            }]);

            const questionnaires = await db.rows("SELECT * FROM questionnaire ORDER BY question_id")
                .map(survey => {
                    return {...survey, id: undefined};
                });
            const idAnswer1 = answers.find(answer => answer.answer_text === "Buby").id;
            const idAnswer2 = answers.find(answer => answer.answer_text === "Ok").id;
            expect(questionnaires).to.deep.equal([{
                id: undefined,
                user_app_id: "id-user-1",
                meter_id: "my-meter-id-1",
                question_id: "question1-1",
                answer_id: idAnswer1,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }, {
                id: undefined,
                user_app_id: "id-user-1",
                meter_id: "my-meter-id-1",
                question_id: "question1-2",
                answer_id: idAnswer2,
                date_answered: new Date("2016-01-01T11:22:55Z")
            }]);
        });

        it("on conflict DO NOTHING questionnaire, UPDATE question, INSERT answer", async () => {
            const {id} = await insertQuestionnaireAnswer("Wrong answer");
            await insertQuestionnaireQuestion("question1-1", "wrongCategory", "wrongQuestion");
            await insertQuestionnaire("id-user-1", "my-meter-id-1", id, "question1-1", "2016-01-01T11:22:33Z");

            const event = getEventFromObject({
                data: {
                    id: "1",
                    element:{
                        questionId: "question1",
                        type: "questionnaire",
                        category: "category1",
                        userId: "id-user-1",
                        siteId: "my-meter-id-1",
                        visitId: "my-visit-1",
                        answers: [{
                            id: 1,
                            timestamp: "2016-01-01T11:22:33Z",
                            answer: "Buby",
                            question: {
                                text: "What's your name?",
                                category: "category1"
                            }
                        }]
                    }
                },
                type: "element inserted in collection answers"
            });

            await run(handler, event);

            const answers = await db.rows("SELECT * FROM answer ORDER BY id");
            const answersNoId = answers.map(answer => {
                return {...answer, id: undefined};
            });
            expect(answersNoId).to.deep.equal([{
                id: undefined,
                answer_text: "Wrong answer"
            }, {
                id: undefined,
                answer_text: "Buby"
            }]);

            const questions = await db.rows("SELECT * FROM question ORDER BY id");
            expect(questions).to.deep.equal([{
                id: "question1-1",
                question_category: "category1",
                question_text: "What's your name?"
            }]);

            const questionnaires = await db.rows("SELECT * FROM questionnaire ORDER BY question_id")
                .map(survey => {
                    return {...survey, id: undefined};
                });
            const idAnswer1 = answers.find(answer => answer.answer_text === "Wrong answer").id;
            const idAnswer2 = answers.find(answer => answer.answer_text === "Buby").id;
            expect(questionnaires).to.deep.equal([{
                id: undefined,
                user_app_id: "id-user-1",
                meter_id: "my-meter-id-1",
                question_id: "question1-1",
                answer_id: idAnswer1,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }, {
                id: undefined,
                user_app_id: "id-user-1",
                meter_id: "my-meter-id-1",
                question_id: "question1-1",
                answer_id: idAnswer2,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }]);
        });
    });

    describe("on survey answers", async () => {
        it("INSERT multiple surveys, questions and answers", async () => {
            const event = getEventFromObject({
                data: {
                    id: "1",
                    element:{
                        questionId: "question1",
                        type: "survey",
                        category: "category1",
                        userId: "id-user-1",
                        visitId: "my-visit-1",
                        answers: [{
                            id: 1,
                            timestamp: "2016-01-01T11:22:33Z",
                            answer: "One",
                            question: {
                                text: "Question number 1?",
                                category: "category1"
                            }
                        }, {
                            id: 2,
                            timestamp: "2016-01-01T11:22:55Z",
                            answer: "Two",
                            question: {
                                text: "Question number 2?",
                                category: "category2"
                            }
                        }]
                    }
                },
                type: "element inserted in collection answers"
            });

            await run(handler, event);

            const answers = await db.rows("SELECT * FROM survey_answer ORDER BY answer_text");
            const answersNoId = answers.map(answer => {
                return {...answer, id: undefined};
            });
            expect(answersNoId).to.deep.equal([{
                id: undefined,
                answer_text: "One"
            }, {
                id: undefined,
                answer_text: "Two"
            }]);

            const questions = await db.rows("SELECT * FROM survey_question ORDER BY id");
            expect(questions).to.deep.equal([{
                id: "question1-1",
                question_category: "category1",
                question_text: "Question number 1?"
            }, {
                id: "question1-2",
                question_category: "category1",
                question_text: "Question number 2?"
            }]);

            const surveys = await db.rows("SELECT * FROM survey ORDER BY survey_question_id")
                .map(survey => {
                    return {...survey, id: undefined};
                });
            const idAnswer1 = answers.find(answer => answer.answer_text === "One").id;
            const idAnswer2 = answers.find(answer => answer.answer_text === "Two").id;
            expect(surveys).to.deep.equal([{
                id: undefined,
                user_app_id: "id-user-1",
                survey_question_id: "question1-1",
                survey_answer_id: idAnswer1,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }, {
                id: undefined,
                user_app_id: "id-user-1",
                survey_question_id: "question1-2",
                survey_answer_id: idAnswer2,
                date_answered: new Date("2016-01-01T11:22:55Z")
            }]);
        });

        it("on conflict DO NOTHING questionnaire, UPDATE question, INSERT answer", async () => {
            const {id} = await insertSurveyAnswer("Wrong answer");
            await insertSurveyQuestion("question1-1", "wrongCategory", "wrongQuestion");
            await insertSurvey("id-user-1", id, "question1-1", "2016-01-01T11:22:33Z");


            const event = getEventFromObject({
                data: {
                    id: "1",
                    element:{
                        questionId: "question1",
                        type: "survey",
                        category: "category1",
                        userId: "id-user-1",
                        visitId: "my-visit-1",
                        answers: [{
                            id: 1,
                            timestamp: "2016-01-01T11:22:33Z",
                            answer: "One",
                            question: {
                                text: "Question number 1?"
                            }
                        }]
                    }
                },
                type: "element inserted in collection answers"
            });

            await run(handler, event);

            const answers = await db.rows("SELECT * FROM survey_answer ORDER BY id");
            const answersNoId = answers.map(answer => {
                return {...answer, id: undefined};
            });
            expect(answersNoId).to.deep.equal([{
                id: undefined,
                answer_text: "Wrong answer"
            }, {
                id: undefined,
                answer_text: "One"
            }]);

            const questions = await db.rows("SELECT * FROM survey_question ORDER BY id");
            expect(questions).to.deep.equal([{
                id: "question1-1",
                question_category: "category1",
                question_text: "Question number 1?"
            }]);

            const surveys = await db.rows("SELECT * FROM survey ORDER BY survey_question_id")
                .map(survey => {
                    return {...survey, id: undefined};
                });
            const idAnswer1 = answers.find(answer => answer.answer_text === "Wrong answer").id;
            const idAnswer2 = answers.find(answer => answer.answer_text === "One").id;
            expect(surveys).to.deep.equal([{
                id: undefined,
                user_app_id: "id-user-1",
                survey_question_id: "question1-1",
                survey_answer_id: idAnswer1,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }, {
                id: undefined,
                user_app_id: "id-user-1",
                survey_question_id: "question1-1",
                survey_answer_id: idAnswer2,
                date_answered: new Date("2016-01-01T11:22:33Z")
            }]);
        });
    });
});
