"use client";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Form,
  Organization,
  Event,
  Question,
  Role,
  QuestionType,
} from "@prisma/client";
import { useState, useEffect, useTransition, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  updateFormName,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  QuestionDataInputCreate,
  QuestionDataInputUpdate,
  batchUpdateQuestionOrder,
  updateForm,
  UpdateFormInput,
} from "@/lib/actions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ShortTextIcon from "./svgs/short-text";
import LongTextIcon from "./svgs/long-text";

import {
  ChevronDownIcon,
  Command,
  PlusIcon,
  MoreVertical,
  Check,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  CalendarRange,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import DrawerPaper from "@/components/drawer-paper";
import { Badge } from "@/components/ui/badge";
import PaperDoc from "@/components/paper-doc";
import locales from "@/locales/en-US/translations.json";
import { useDebouncedCallback } from "use-debounce";
import DrawerLink from "@/components/drawer-link";
import FormTitle from "@/components/form-title";
import { toast } from "sonner";
import { cn, getSubdomainUrl } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { QuestionSettingsForm } from "./question-settings-form";
import { DateRangePicker } from "./date-range-picker";
import { DatePicker } from "./date-picker";
import YesNoIcon from "./svgs/yes-no";
import { Session } from "next-auth";

type FormAndContext = Form & {
  organization: Organization;
  event: Event | null;
  questions: Question[];
  role: Role[];
};
const questionTypes = Object.values(QuestionType);

export default function FormBuilder({
  session,
  form,
}: {
  session: Session;
  form: FormAndContext;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPendingSaving, setIsPendingSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  let [isPendingPublishing, startTransitionPublishing] = useTransition();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { subdomain } = useParams() as { subdomain: string };

  const [selectedQuestionType, setSelectedQuestionType] =
    useState<QuestionType>(QuestionType.SHORT_TEXT);

  useEffect(() => {
    setFormName(form.name);
    setQuestions(form.questions.sort((q1, q2) => q1.order - q2.order));
  }, [form.name, form.questions]);

  const handleUpdateName = async (name: string) => {
    if (form.name !== formName) {
      setFormName(name);
      updateFormName(form.id, name);
    }
  };

  const handleUpdate = async (input: UpdateFormInput) => {
    if (form.name !== input.name || form.published !== input.published) {
      updateForm(form.id, input);
    }
  };

  const handleCreateQuestion = async (data: QuestionDataInputCreate) => {
    const newQuestion = await createQuestion(data);
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = async (
    id: string,
    data: QuestionDataInputUpdate,
  ) => {
    setIsPendingSaving(true);
    const updatedQuestion = await updateQuestion(id, data);
    const updatedQuestions = questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q,
    );
    setQuestions(updatedQuestions);
    setIsPendingSaving(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    const updatedQuestions = questions.filter((q) => q.id !== id);
    const updatedItems = updatedQuestions.map((item, index) => {
      return { ...item, order: index };
    });

    // Update the state
    setQuestions(updatedItems);
    // Prepare batch update operations
    await batchUpdateQuestionOrder(updatedItems);
  };

  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    // Update the order of each question
    const updatedItems = items.map((item, index) => {
      return { ...item, order: index };
    });

    // Update the state
    setQuestions(updatedItems);

    // Prepare batch update operations
    await batchUpdateQuestionOrder(updatedItems);
  };

  const handleCreateNewQuestion = async (type: QuestionType) => {
    const data = {
      formId: form.id,
      text: newQuestion,
      type: type,
    };
    handleCreateQuestion(data);
    setNewQuestion("");
  };

  const block = searchParams.get("block");

  useEffect(() => {
    if (!block && questions?.[0]) {
      router.replace(`${pathname}?block=${questions?.[0].id}`);
    }
  }, [block, pathname, questions, router]);

  const handleUpdateQuestionText = (newQ: Question, text: string) => {
    const nextQuestions = questions.map((q) =>
      q.id === newQ.id ? { ...q, text } : q,
    );
    setQuestions(nextQuestions);
    handleUpdateQuestionThrottled(newQ.id, { id: newQ.id, text: text });
  };

  const handleUpdateQuestionDsc = (newQ: Question, description: string) => {
    const nextQuestions = questions.map((q) =>
      q.id === newQ.id ? { ...q, description } : q,
    );
    setQuestions(nextQuestions);
    handleUpdateQuestionThrottled(newQ.id, {
      id: newQ.id,
      description: description,
    });
  };

  const handleUpdateQuestionThrottled = useDebouncedCallback(
    (id, data) => {
      return updateQuestion(id, data);
    },
    600,
    { trailing: true },
  );

  const selectedQuestion = questions.find(
    ({ id }) => id === searchParams.get("block"),
  );

  return (
    <div className="flex flex-1 flex-row text-gray-800 dark:text-gray-200">
      <div className="absolute bottom-0 left-0 top-0">
        <DrawerPaper showSidebar={false} className="px-0">
          <div className="flex flex-col">
            <DrawerLink
              name={"Back to Forms"}
              href={`/city/${form.organization.subdomain}/forms`}
              icon={<ArrowLeft width={18} />}
              isActive={false}
            />

            <div className="flex items-center justify-between py-4 pl-4 pr-3">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200">
                Content
              </h6>
              <Popover>
                <PopoverTrigger>
                  {
                    <Button size="icon" className="h-8 w-8">
                      <PlusIcon className="h-4" />
                    </Button>
                  }
                </PopoverTrigger>
                <PopoverContent
                  sideOffset={10}
                  className=" space-y-4 bg-gray-50/50 backdrop-blur-sm dark:bg-gray-750"
                >
                  {questionTypes
                    .filter(
                      (type) =>
                        type !== QuestionType.MULTI_SELECT &&
                        type !== QuestionType.SELECT,
                    )
                    .map((type) => {
                      return (
                        <Button
                          key={type}
                          value={type}
                          onClick={() => handleCreateNewQuestion(type)}
                          className="flex w-36 justify-start"
                        >
                          <span className="pr-4">
                            {questionTypeToBadgeIcon(type)}
                          </span>
                          <span className="pr-1">
                            {questionTypeToDisplayText(type)}
                          </span>
                        </Button>
                      );
                    })}
                </PopoverContent>
              </Popover>
            </div>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {questions.map((q, index) => (
                      <Draggable key={q.id} draggableId={q.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex h-14 w-full items-center justify-between py-4 pl-4 pr-2 text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-750",
                              selectedQuestion && selectedQuestion.id === q.id
                                ? "bg-gray-300 dark:bg-gray-850"
                                : "",
                            )}
                            onClick={() => {
                              router.replace(`${pathname}?block=${q.id}`);
                            }}
                          >
                            <QuestionBadge q={q} />
                            <p className="ml-3 flex flex-1 text-xs">{q.text}</p>
                            <Popover>
                              <PopoverTrigger>
                                <MoreVertical size={16} />
                              </PopoverTrigger>
                              <PopoverContent>
                                <Button
                                  variant={"destructive"}
                                  size={"sm"}
                                  onClick={() => handleDeleteQuestion(q.id)}
                                >
                                  Delete
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </DrawerPaper>
      </div>
      <div className="relative flex w-full flex-1 flex-col space-y-6 xl:pr-60">
        <PaperDoc className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <FormTitle
              onMouseEnter={() => setIsEditing(true)}
              onMouseLeave={() => {
                setIsEditing(false);
                handleUpdateName(formName);
              }}
            >
              {isEditing ? (
                <Input
                  className="p-2 font-serif text-3xl dark:text-white"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onKeyDownCapture={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateName(formName);
                      setIsEditing(false);
                    }
                  }}
                />
              ) : (
                formName
              )}
            </FormTitle>
            <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
              {/* {form.published && (
                <a
                  href={`${getSubdomainUrl(subdomain)}/forms/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500"
                >
                  <span className="flex items-center">
                    <span className="hidden md:block">{`${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/forms/`}</span>
                    <span>{`${form.id}`}</span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )} */}
              <div className="bg-brand-50 rounded-lg px-2 py-1 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                {isPendingSaving ? "Saving..." : "Saved"}
              </div>
              <Button
                onClick={() => {
                  startTransitionPublishing(async () => {
                    await handleUpdate({ published: !form.published }).then(
                      () => {
                        toast.success(
                          `Successfully ${
                            form.published ? "unpublished" : "published"
                          } your post.`,
                        );
                      },
                    );
                  });
                }}
                className={cn(
                  "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none",
                  isPendingPublishing
                    ? "bg-brand-50 bg-button-gradient cursor-not-allowed text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    : "active:bg-brand-50 active:bg-button-gradient-lighten text-gray-100 hover:bg-gray-50 hover:bg-button-gradient-lighten dark:border-gray-700 dark:hover:border-gray-200 dark:hover:bg-black dark:hover:text-gray-100 dark:active:bg-gray-800",
                )}
                disabled={isPendingPublishing}
              >
                {isPendingPublishing ? (
                  <LoadingDots />
                ) : (
                  <p>{form.published ? "Unpublish" : "Publish"}</p>
                )}
              </Button>
            </div>
          </div>

          <div>
            {questions.map((q, index) => (
              <EditableQuestion
                key={q.id}
                q={q}
                handleUpdateQuestion={handleUpdateQuestion}
                handleUpdateQuestionText={handleUpdateQuestionText}
                handleUpdateQuestionDsc={handleUpdateQuestionDsc}
              />
            ))}
          </div>
        </PaperDoc>
      </div>
      <RightDrawer
        form={form}
        questions={questions}
        selectedQuestion={selectedQuestion}
        handleUpdateQuestion={handleUpdateQuestion}
      />
    </div>
  );
}

const RightDrawer = ({
  questions,
  selectedQuestion,
  form,
  handleUpdateQuestion,
}: {
  questions: Question[];
  selectedQuestion?: Question;
  form: Form;
  handleUpdateQuestion: (
    id: string,
    data: QuestionDataInputUpdate,
  ) => Promise<void>;
}) => {
  if (!selectedQuestion) {
    return null;
  }

  return (
    <DrawerPaper
      showSidebar={true}
      className="fixed bottom-0 right-0 top-0 hidden border-l pl-6 xl:flex xl:w-60"
    >
      <QuestionSettingsForm
        question={selectedQuestion}
        handleUpdateQuestion={handleUpdateQuestion}
      />
    </DrawerPaper>
  );
};

type EditableQuestionProps = {
  q: Question;
  handleUpdateQuestion: (id: string, data: any) => void;
  handleUpdateQuestionText: (q: Question, text: string) => void;
  handleUpdateQuestionDsc: (q: Question, description: string) => void;
};

const EditableQuestion = ({
  q,
  handleUpdateQuestion,
  handleUpdateQuestionText,
  handleUpdateQuestionDsc,
}: EditableQuestionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDsc, setIsEditingDsc] = useState(false);

  return (
    <div className="my-8">
      <div
        onMouseEnter={() => setIsEditing(true)}
        onMouseLeave={() => {
          setIsEditing(false);
        }}
        className="flex"
      >
        <div className="text-lg font-semibold w-full h-12">
          {isEditing ? (
            <Input
              className="m-0 h-auto border-0 border-collapse text-lg p-2 focus:outline-none"
              placeholder={locales.QUESTION_PLACEHODLER_TEXT}
              type="ghost"
              value={q.text}
              onChange={(e) => handleUpdateQuestionText(q, e.target.value)}
              onBlur={() => {
                setIsEditing(false);

                // handleUpdateQuestionText(questionText);
              }}
            />
          ) : q.text.length > 0 ? (
            <span className="p-2 flex items-center">{q.text}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 p-2 flex items-center">
              {locales.QUESTION_PLACEHODLER_TEXT}
            </span>
          )}
        </div>
        <span className="ml-1">{q.required && <span>*</span>} <span className="text-gray-400 dark:text-gray-600">{'(required)'}</span></span>
      </div>
      <div
        onMouseEnter={() => setIsEditingDsc(true)}
        onMouseLeave={() => {
          setIsEditingDsc(false);
        }}
        className="min-h-[56px]"
      >
        {isEditingDsc ? (
          <Input
            className="text-md m-0 h-auto border-0 p-2 focus:outline-none resize-none"
            placeholder={"Optional description"}
            value={q.description ? q.description : undefined}
            onChange={(e) => handleUpdateQuestionDsc(q, e.target.value)}
            onBlur={() => {
              setIsEditingDsc(false);
            }}
          />
        ) : q?.description && q.description?.length > 0 ? (
          <div className="p-2">{q.description}</div>
        ) : (
          <div className="text-md text-gray-400 dark:text-gray-600 p-2">
            {"Optional description"}
          </div>
        )}
      </div>

      {mapQuestionTypeToInput(q)}
      {q.type === QuestionType.DATE_RANGE}
    </div>
  );
};

const QuestionBadge = ({ q }: { q: Question }) => {
  return (
    <Badge className="h-6 gap-x-3 px-1.5">
      <span>{questionTypeToBadgeIcon(q.type)}</span>
      <span className="ml-1">{q.order + 1}</span>
    </Badge>
  );
};

const questionTypeToBadgeIcon = (type: QuestionType) => {
  switch (type) {
    case QuestionType.SHORT_TEXT:
      return <ShortTextIcon className="h-6 fill-gray-150 dark:fill-gray-800" />;
    case QuestionType.LONG_TEXT:
      return <LongTextIcon className="h-6 fill-gray-150 dark:fill-gray-800" />;
    case QuestionType.SELECT:
    case QuestionType.DROPDOWN:
      return <ChevronDown className="h-6 w-4 " />;
    case QuestionType.BOOLEAN:
      return <YesNoIcon className="h-6 w-4 fill-gray-150 dark:fill-gray-800" />;
    case QuestionType.DATE:
      return (
        <Calendar className="h-6 w-4 stroke-gray-150 dark:stroke-gray-800" />
      );
    case QuestionType.DATE_RANGE:
      return <CalendarRange className="h-6 w-4" />;
    default:
      return null;
  }
};

const questionTypeToDisplayText = (type: QuestionType) => {
  switch (type) {
    case QuestionType.SHORT_TEXT:
      return "Short Text";
    case QuestionType.LONG_TEXT:
      return "Long Text";
    case QuestionType.SELECT:
    case QuestionType.DROPDOWN:
      return "Dropdown";
    case QuestionType.BOOLEAN:
      return "Yes/No";
    case QuestionType.DATE:
      return "Date";
    case QuestionType.DATE_RANGE:
      return "Date Range";
    default:
      return type;
  }
};

const mapQuestionTypeToInput = (q: Question) => {
  switch (q.type) {
    case QuestionType.SHORT_TEXT:
      return <Input readOnly={true} type="text" placeholder={"Short answer"}/>;
    case QuestionType.LONG_TEXT:
      return <Textarea readOnly={true} placeholder={"Long answer"}/>;
    case QuestionType.SELECT:
    case QuestionType.DROPDOWN:
      return (
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(() => {
              const variants =
                (q?.variants as { name: string; value: string }[]) || undefined;
              return (
                variants?.map((variant: { name: string; value: string }) => {
                  return (
                    <SelectItem key={variant?.name} value={variant?.value}>
                      {variant?.name}
                    </SelectItem>
                  );
                }) ?? undefined
              );
            })()}
          </SelectContent>
        </Select>
      );
    case QuestionType.DATE:
      return <DatePicker />;
    case QuestionType.DATE_RANGE:
      return <DateRangePicker />;
    case QuestionType.BOOLEAN:
      return <Checkbox />;
    default:
      return null;
  }
};
