import { Stack, Text } from "@fluentui/react";
import * as React from "react";
import { connect } from "react-redux";
import { getStyles } from "components/layout/Sidebar/Nav/Nav.styles";
import { styled, Overlay } from "@fluentui/react";
import { useLocation, useParams } from "react-router-dom";
import {
  removeService,
  updateService,
  createQuestion,
  removeQuestion,
  updateQuestion,
  getQuestions,
} from "redux/service/actions";
import { LocaleSwitcher } from "components/localeSwitcher";
import { QuestionContainer } from "components/containers";
import {
  Button,
  MenuButton,
  AddIcon,
  Dialog,
  Loader,
  ArrowLeftIcon,
} from "@fluentui/react-northstar";
import {
  addTranslationLocale,
  capitaliseSentense,
  flat,
  getFromStorage,
  getPlatformComponents,
  unflatten,
  validateForm,
} from "helpers/utils";
import { DynamicForm } from "components/forms";
import { useIntl } from "react-intl";

const ServiceDetails = ({
  loading,
  questions,
  createQuestionAction,
  getQuestionsAction,
  removeQuestionAction,
  updateQuestionAction,
}) => {
  const [locale, setLocale] = React.useState(getFromStorage("locale"));
  const intl = useIntl();
  const [contentLookUp, setContentLookUp] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogConfirmText, setDialogConfirmText] = React.useState("");
  const [formValues, setFormValues] = React.useState({});
  const [activeQuestionType, setActiveQuestionType] = React.useState(null);
  const [questionTypes, setQuestionTypes] = React.useState([]);
  const [localQuestions, setLocalQuestions] = React.useState([]);
  const [dataPool, setDataPool] = React.useState([]);
  const [optionsCount, setOptionsCount] = React.useState(0);
  const [loaderLabel, setLoaderLabel] = React.useState("");
  const [blockSubmit, setBlockSubmit] = React.useState(false);

  const changeMenuLocale = (event, code) => {
    setLocale(code);
  };

  const addQuestion = [
    {
      label: intl.formatMessage({ id: "question.form.label" }),
      name: "question",
      key: "question",
      type: "string",
      required: true,
      translatable: true,
      variant: "northstar",
      hasPlaceholders: true,
    },
    {
      label: intl.formatMessage({ id: "question.form.hint" }),
      name: "hint",
      key: "hint",
      type: "string",
      required: false,
      translatable: true,
      variant: "northstar",
      hasPlaceholders: true,
    },
    {
      label: intl.formatMessage({ id: "question.form.reference" }),
      name: "description",
      key: "description",
      type: "string",
      required: true,
      translatable: false,
      variant: "northstar",
      unique: true,
    },
  ];

  const location = useLocation();
  const params = useParams();

  const isValid = (state) => {
    setBlockSubmit(state);
  };

  const swapPositions = (index, newPos) => {
    let swapped = localQuestions.map((item, idx) => {
      return idx - index
        ? idx - newPos
          ? item
          : localQuestions[index]
        : localQuestions[newPos];
    });
    // setQuestions(swapped);
    //Update the positions in db
    updateQuestionAction({
      id: swapped[index].id,
      position: index + 1,
      serviceId: params.serviceId,
    });
    updateQuestionAction({
      id: swapped[newPos].id,
      position: newPos + 1,
      serviceId: params.serviceId,
    });
  };

  const valuesChanged = (values) => {
    setFormValues(values);
  };

  const newQuestion = (qType) => {
    setActiveQuestionType(qType);
    setDialogOpen(true);
    setDialogTitle(
      intl.formatMessage(
        { id: "general.add" },
        { subject: intl.formatMessage({ id: "question" }, { count: 1 }) }
      )
    );
    setDialogConfirmText(intl.formatMessage({ id: "general.create" }));
  };

  const preventSubmit = (status, message = "") => {
    setBlockSubmit(status);
    setLoaderLabel(message);
  };

  React.useEffect(() => {
    getPlatformComponents(
      "question_types?groups[]=translations",
      "questionTypes"
    ).then((result) => setQuestionTypes(result));
    getQuestionsAction(params.serviceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    setLocalQuestions(questions);
    let dp = questions.reduce((a, q) => {
      if (q.description) {
        a.push(q.description);
      }
      return a;
    }, []);
    setDataPool(dp);
  }, [questions]);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Stack
        horizontal
        horizontalAlign="space-between"
        tokens={{ childrenGap: "l1", padding: "l1" }}
        verticalAlign="center"
      >
        <Button
          icon={<ArrowLeftIcon />}
          text
          content={intl.formatMessage({ id: "general.nav.backtolist" })}
          onClick={() => window.history.back()}
        />
        <Text block variant={"xLarge"}>
          {intl.formatMessage(
            { id: "service.builder" },
            { service: location.state?.title ? location.state?.title : "" }
          )}
        </Text>
        <LocaleSwitcher locale={locale} _onChange={changeMenuLocale} />
      </Stack>
      <Stack>
        {loading ? (
          <Loader
            size="largest"
            label={intl.formatMessage({ id: "general.loading" })}
            labelPosition="below"
          />
        ) : (
          localQuestions &&
          localQuestions.map((question, idx) => {
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
                  setDialogTitle(
                    intl.formatMessage(
                      { id: "general.add" },
                      {
                        subject: intl.formatMessage(
                          { id: "question" },
                          { count: 1 }
                        ),
                      }
                    )
                  );
                  setDialogConfirmText(
                    intl.formatMessage({ id: "general.create" })
                  );
                  setOptionsCount(question.questionOptions.length);
                }}
                onRemove={() => {
                  removeQuestionAction({
                    id: question.id,
                    serviceId: params.serviceId,
                  });
                }}
                onUpdate={updateQuestionAction}
                index={idx}
                key={question.id}
                isLast={localQuestions[idx + 1] ? false : true}
                isPublished={question.isPublished}
                locale={locale}
                question={question}
                loading
                serviceId={params.serviceId}
                validations={
                  questionTypes.length > 0
                    ? questionTypes.reduce((prev, curr) => {
                        if (
                          curr.id === question.questionType.id &&
                          curr.validations.length > 0
                        ) {
                          prev = [...prev, ...curr.validations];
                        }
                        return prev;
                      }, [])
                    : []
                }
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
                  setDialogTitle(
                    intl.formatMessage(
                      { id: "general.edit" },
                      {
                        subject: intl.formatMessage(
                          { id: "question" },
                          { count: 1 }
                        ),
                      }
                    )
                  );
                  setActiveQuestionType(
                    questionTypes.filter(
                      (qt) => qt.id === question.questionType.id
                    )[0]
                  );

                  setDialogConfirmText(
                    intl.formatMessage(
                      { id: "general.update" },
                      {
                        subject: intl.formatMessage(
                          { id: "question" },
                          { count: 1 }
                        ),
                      }
                    )
                  );
                  setOptionsCount(question.questionOptions.length);
                  setDialogOpen(true);
                }}
              />
            );
          })
        )}
        <Dialog
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
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
              }}
              style={{ width: "100%" }}
            >
              {loaderLabel !== "" && (
                <Overlay className={"loader"}>
                  <Loader label={loaderLabel} size="largest" />
                </Overlay>
              )}
              <DynamicForm
                inputValues={formValues}
                valuesChanged={valuesChanged}
                preventSubmit={preventSubmit}
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
                          addText: intl.formatMessage(
                            { id: "general.add" },
                            {
                              subject: intl.formatMessage(
                                { id: "general.options" },
                                { count: 2 }
                              ),
                            }
                          ),
                          count: optionsCount,
                          fields: [
                            {
                              name: "value",
                              key: "value",
                              required: true,
                              length: 300,
                              type: "string",
                              label: capitaliseSentense(
                                intl.formatMessage(
                                  { id: "general.add" },
                                  {
                                    subject: intl.formatMessage(
                                      { id: "general.options" },
                                      { count: 1 }
                                    ),
                                  }
                                )
                              ),
                              translatable: true,
                              multiple: true,
                              variant: "northstar",
                            },
                          ],
                        },
                      ]
                    : addQuestion
                }
                reverse={false}
                dataPool={dataPool}
                isValid={isValid}
                disableSubmit={blockSubmit}
                onSubmit={(e) => {
                  let hasErrors = validateForm(
                    e.target.closest("form").elements
                  );
                  if (!hasErrors) {
                    //Let's add locale key as required by api
                    let data = unflatten(addTranslationLocale(formValues));
                    if (data.hasOwnProperty("questionOptions"))
                      data["questionOptions"] = data?.questionOptions.value;

                    if (
                      dialogConfirmText.toLocaleLowerCase().includes("create")
                    ) {
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
                        data["service"] = `/api/services/${params.serviceId}`;

                      if (
                        !data.hasOwnProperty("contentLookUp") &&
                        contentLookUp !== null
                      )
                        data["contentLookUp"] = contentLookUp;

                      createQuestionAction({
                        ...data,
                        ...{
                          questionType: `/api/question_types/${activeQuestionType.id}`,
                          position: localQuestions.length,
                        },
                      });
                    } else {
                      updateQuestionAction({
                        ...data,
                        questionType: `/api/question_types/${data.questionType.id}`,
                        serviceId: params.serviceId,
                      });
                    }
                    setDialogOpen(false);
                    setFormValues({});
                    setContentLookUp(null);
                  } else {
                    preventSubmit(true, "");
                  }
                }}
              />
            </form>
          }
        />

        <Stack.Item style={{ margin: `40px auto 30px auto`, width: `680px` }}>
          <MenuButton
            trigger={
              <Button
                icon={<AddIcon />}
                title={intl.formatMessage({
                  id: "general.navigation.dropdown",
                })}
                content={intl.formatMessage(
                  { id: "general.add" },
                  {
                    subject: intl.formatMessage(
                      { id: "question" },
                      { count: 1 }
                    ),
                  }
                )}
              />
            }
            menu={questionTypes.map((type) => {
              if (!type.icon.includes("SIcon")) {
                return {
                  key: type.id,
                  content: type.translations[locale]?.name,
                  onClick: () => {
                    newQuestion(type);
                  },
                };
              } else {
                return {
                  key: type.id,
                  content: type.translations[locale]?.name,
                  menu: [
                    {
                      content: capitaliseSentense(
                        intl.formatMessage({ id: "language" }, { count: 2 })
                      ),
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
                      content: capitaliseSentense(
                        intl.formatMessage({ id: "channels" }, { count: 2 })
                      ),
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
  const { loading, questions, error } = serviceReducer;
  return { loading, error, questions };
};

export default connect(mapStateToProps, {
  removeServiceAction: removeService,
  updateServiceAction: updateService,
  getQuestionsAction: getQuestions,
  createQuestionAction: createQuestion,
  removeQuestionAction: removeQuestion,
  updateQuestionAction: updateQuestion,
})(styled(ServiceDetails, getStyles));
