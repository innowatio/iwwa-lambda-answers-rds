import {saveSurvey} from "steps/save-survey";
import {saveQuestionnaire} from "steps/save-questionnaire";
import {skip} from "steps/skip";

export default async function pipeline (event) {

    const element = event.data.element;

    // skip if meter or user are not on PostgresDB
    if (!element.type || await skip(element)) {
        return null;
    }

    switch (element.type) {
    case "survey":
        await saveSurvey(element);
        break;
    case "questionnaire":
        await saveQuestionnaire(element);
        break;
    }

    return null;
}
