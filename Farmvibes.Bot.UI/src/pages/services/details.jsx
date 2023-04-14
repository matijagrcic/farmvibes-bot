import { Stack, Text } from "@fluentui/react";
import * as React from "react";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { styled } from "@fluentui/react";
import {
  getService,
  removeService,
  updateService,
  createQuestion,
  removeQuestion,
  updateQuestion,
} from "redux/service/actions";
import { LocaleSwitcher } from "components/localeSwitcher";
import { QuestionContainer } from "components/containers";
import {
  Button,
  MenuButton,
  AddIcon,
  MenuItem,
  Dialog,
  Loader,
} from "@fluentui/react-northstar";
import {
  addTranslationLocale,
  flat,
  getFromStorage,
  makeListRequest,
  unflatten,
} from "helpers/utils";
import { DynamicForm } from "components/forms";
import { addQuestion } from "global/defaultValues";
import { utcDays } from "d3";
import validations from "pages/configurations/validations";

const ServiceDetails = ({
  loading,
  service,
  error,
  match,
  createQuestionAction,
  updateServiceAction,
  getServiceAction,
  removeQuestionAction,
  updateQuestionAction,
}) => {
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const [contentLookUp, setContentLookUp] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogConfirmText, setDialogConfirmText] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [activeQuestionType, setActiveQuestionType] = React.useState(null);
  const [questionTypes, setQuestionTypes] = React.useState([]);
  const [questions, setQuestions] = React.useState([]);
  const [optionsCount, setOptionsCount] = React.useState(0);

  const changeMenuLocale = (event, code) => {
    setLocale(code);
  };

  const duplicateQuestion = (index) => {
    setQuestions((prev) => {
      return [...prev, prev[index]];
    });
  };

  const swapPositions = (index, newPos) => {
    let swapped = questions.map((item, idx) => {
      return idx - index
        ? idx - newPos
          ? item
          : questions[index]
        : questions[newPos];
    });
    // setQuestions(swapped);
    //Update the positions in db
    updateQuestionAction({ id: swapped[index].id, position: index + 1 });
    updateQuestionAction({ id: swapped[newPos].id, position: newPos + 1 });
  };

  const valuesChanged = (values) => {
    setFormValues((prev) => {
      return { ...prev, ...values };
    });
  };

  const newQuestion = (qType) => {
    setActiveQuestionType(qType);
    setDialogOpen(true);
    setDialogTitle("Add question");
    setDialogConfirmText("Create");
  };

  React.useEffect(() => {
    makeListRequest({
      url: `question_types`,
      options: {
        "groups[]": "translations",
      },
    }).then((result) => {
      //May be a new menu without lables
      setQuestionTypes(result);
    });
  }, [match]);

  React.useEffect(() => {
    getServiceAction(match.params.serviceId, "&groups[]=question:read");
  }, [getServiceAction]);

  React.useEffect(() => {
    setQuestions(() => {
      return service.questions !== undefined
        ? service?.questions.sort(function (a, b) {
            return a.position - b.position;
          })
        : [];
    });
  }, [service]);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Stack
        horizontal
        horizontalAlign='space-between'
        tokens={{ childrenGap: "l1", padding: "l1" }}
        verticalAlign='center'
      >
        <Text block variant={"xLarge"}>
          {`Service Builder: ${
            service?.translations ? service?.translations[locale].name : ""
          } `}
        </Text>
        <LocaleSwitcher locale={locale} _onChange={changeMenuLocale} />
      </Stack>
      <Stack>
        {questions &&
          questions.map((question, idx) => {
            return (
              <QuestionContainer
                swapAction={swapPositions}
                duplicateAction={() => {
                  let { createdAt, updatedAt, position, id, ...rest } =
                    question;
                  rest["questionOptions"] = {
                    value: question.questionOptions.map((option) => {
                      let { id, ...other } = option;
                      return other;
                    }),
                  };
                  setFormValues(flat(rest));
                  setActiveQuestionType(question.questionType);
                  setDialogOpen(true);
                  setDialogTitle("Add question");
                  setDialogConfirmText("Create");
                  setOptionsCount(question.questionOptions.length);
                }}
                onRemove={() => {
                  removeQuestionAction(question.id);
                }}
                onUpdate={(payload) => {
                  updateQuestionAction({
                    id: question.id,
                    ...payload,
                  });
                }}
                index={idx}
                key={question.id}
                isLast={questions[idx + 1] ? false : true}
                isPublished={question.isPublished}
                locale={locale}
                question={question}
                loading
                validations={questionTypes.reduce((prev, curr) => {
                  if (
                    curr.id === question.questionType.id &&
                    curr.validations.length > 0
                  ) {
                    prev = [...prev, ...curr.validations];
                  }
                  return prev;
                }, [])}
                editQuestion={() => {
                  //To do: flatten array fields without having to manage this manually
                  setFormValues(
                    flat({
                      ...question,
                      ...{
                        questionOptions: { value: question.questionOptions },
                      },
                    })
                  );
                  setDialogTitle("Edit question");
                  setActiveQuestionType(question.questionType);
                  setDialogOpen(true);
                  setDialogConfirmText("Update");
                  setOptionsCount(question.questionOptions.length);
                }}
              />
            );
          })}
        <Dialog
          cancelButton='Cancel'
          confirmButton={dialogConfirmText}
          onConfirm={() => {
            //Let's add locale key as required by api
            let data = unflatten(addTranslationLocale(formValues));
            if (data.hasOwnProperty("questionOptions"))
              data["questionOptions"] = data?.questionOptions.value;

            if (dialogConfirmText.toLocaleLowerCase().includes("create")) {
              if (!data.hasOwnProperty("attributes"))
                data["attributes"] = activeQuestionType.attributes.map(
                  (attribute) => {
                    return {
                      id: attribute.id,
                      value: attribute.defaultValue,
                      name: attribute.name,
                    };
                  }
                );

              if (!data.hasOwnProperty("service"))
                data["service"] = `/api/services/${service.id}`;

              if (
                !data.hasOwnProperty("contentLookUp") &&
                contentLookUp !== null
              )
                data["contentLookUp"] = contentLookUp;

              createQuestionAction({
                ...data,
                ...{
                  questionType: `/api/question_types/${activeQuestionType.id}`,
                  position: service.questions.length,
                },
              });
            } else {
              updateQuestionAction({
                ...data,
                questionType: `/api/question_types/${data.questionType.id}`,
              });
            }
            setDialogOpen(false);
            setFormValues({});
            setContentLookUp(null);
          }}
          header={dialogTitle}
          temporary={loading.toString()}
          disabled={loading}
          open={dialogOpen}
          onOpen={() => setDialogOpen(true)}
          onCancel={() => {
            setDialogOpen(false);
            setFormValues({});
            setContentLookUp(null);
          }}
          content={
            <DynamicForm
              inputValues={formValues}
              valuesChanged={valuesChanged}
              inputs={
                activeQuestionType && activeQuestionType.hasOptions
                  ? [
                      ...addQuestion,
                      {
                        type: "array",
                        name: "questionOptions",
                        key: "questionOptions",
                        translatable: true,
                        required: true,
                        addText: "Add options",
                        count: optionsCount,
                        fields: [
                          {
                            name: "value",
                            key: "value",
                            required: true,
                            length: 300,
                            type: "string",
                            label: "Option",
                            translatable: true,
                            multiple: true,
                            variant: "northstar",
                          },
                        ],
                      },
                    ]
                  : addQuestion
              }
            />
          }
        />
        {loading && (
          <Loader size='largest' label='loading' labelPosition='below' />
        )}
        <Stack.Item style={{ margin: `40px auto 30px auto`, width: `680px` }}>
          <MenuButton
            trigger={
              <Button
                icon={<AddIcon />}
                title='Open Menu'
                content='Add question'
              />
            }
            menu={questionTypes.map((type) => {
              if (!type.icon.includes("Search")) {
                return {
                  key: type.id,
                  content: type.translations[locale].name,
                  onClick: () => {
                    newQuestion(type);
                  },
                };
              } else {
                return {
                  key: type.id,
                  content: type.translations[locale].name,
                  menu: [
                    {
                      content: "Administrative units",
                      menu: getFromStorage("administrativeUnits").map(
                        (unit) => {
                          return {
                            key: unit.name.toLocaleLowerCase(),
                            content: unit.name,
                            tooltip: unit.description,
                            onClick: () => {
                              newQuestion(type);
                              setContentLookUp({
                                key: "name",
                                entity: "locations",
                                value: "id",
                                filters: `type=/api/administrative/${unit.id}`,
                              });
                            },
                          };
                        }
                      ),
                    },
                    {
                      content: "Languages",
                      key: "languages",
                      onClick: () => {
                        newQuestion(type);
                        setContentLookUp({
                          key: "name",
                          value: "code",
                          entity: "languages",
                        });
                      },
                    },
                    {
                      content: "Channels",
                      key: "channels",
                      onClick: () => {
                        newQuestion(type);
                        setContentLookUp({
                          key: "name",
                          value: "id",
                          entity: "channels",
                        });
                      },
                    },
                  ],
                };
              }
            })}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

const mapStateToProps = ({ serviceReducer }) => {
  const { loading, services, service, error } = serviceReducer;
  return { loading, error, services, service };
};

export default connect(mapStateToProps, {
  getServiceAction: getService,
  removeServiceAction: removeService,
  updateServiceAction: updateService,
  createQuestionAction: createQuestion,
  removeQuestionAction: removeQuestion,
  updateQuestionAction: updateQuestion,
})(styled(ServiceDetails, getStyles));
