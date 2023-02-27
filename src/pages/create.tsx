import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import { CARD_ASPECT } from "../components/Collection";
import { SubmitField, TextField, UploadField } from "../components/Field";
import { Close, Empty, Spin } from "../components/Icons";
import { LayoutCentered, LayoutWithNav } from "../components/Layout";
import { api } from "../utils/api";

const MINI_CARD_WIDTH = 175;

const CreatePage: NextPage = () => {
  const router = useRouter();

  const createCollection = api.collection.create.useMutation();
  const confirmCollection = api.collection.confirm.useMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Uploadable[]>([]);
  const [nameError, setNameError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPerc, setSubmitPerc] = useState("0");

  const handleNameChange = (newName: string) => {
    setName(newName);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handleFilesReceive = (received: FileList) => {
    for (const fileReceived of received) {
      if (!files.find((f) => f.file.name === fileReceived.name)) {
        setFiles(
          files.concat([
            { file: fileReceived, status: "evaluating", progress: 0 },
          ])
        );

        const reader = new FileReader();

        reader.onload = (e) => {
          const previewUrl = e.target?.result;

          if (typeof previewUrl === "string") {
            setFiles((f) =>
              f.map((it) =>
                it.file.name === fileReceived.name ? { ...it, previewUrl } : it
              )
            );
          } else {
            setFiles((f) =>
              f.map((it) =>
                it.file.name === fileReceived.name
                  ? { ...it, status: "error" }
                  : it
              )
            );
          }
        };
        reader.readAsDataURL(fileReceived);
      }
    }
  };

  const handleDelete = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const progressStep = 100 / (2 + files.length);

    setIsSubmitting(true);
    setSubmitPerc(String(0));

    const createResponse = await createCollection.mutateAsync({
      name,
      description,
      cardsName: files.map((it) => it.file.name) as [string, ...string[]],
    });

    setSubmitPerc(String(progressStep));

    const promises: Promise<void>[] = [];

    for (const [cardName, uploadLink] of Object.entries(
      createResponse.cardsNameToUploadLink
    )) {
      const file = files.find((it) => it.file.name === cardName);

      if (typeof file === "undefined") {
        // TODO: finish
        return;
      }

      promises.push(
        (async () => {
          const uploadResponse = await fetch(uploadLink, {
            method: "PUT",
            body: file.file,
          });

          if (!uploadResponse.ok) {
            // TODO: show error.
            return;
          }

          setSubmitPerc((v) => String(+v + progressStep));
        })()
      );
    }

    await Promise.all(promises);

    const confirmResponse = await confirmCollection.mutateAsync(
      createResponse.collectionId
    );

    await router.replace(confirmResponse.redirect);
  };

  return (
    <LayoutWithNav>
      <LayoutCentered>
        <div className="flex flex-col gap-8 border-inherit p-4 sm:p-8">
          <DescribeSection
            title="Create Collection"
            content="Quisque ac massa sit amet eros lobortis vulputate. Vestibulum eget
            turpis a felis tincidunt porta. Nullam quis diam in purus vehicula
            tristique. Suspendisse potenti. Aliquam efficitur cursus
            ullamcorper. Quisque quis risus quam. Etiam congue tristique
            fringilla. Donec commodo elit lorem, pellentesque aliquam ipsum
            hendrerit dapibus."
          />

          <div className="flex flex-col gap-4">
            <TextField
              name="Name"
              value={name}
              error={nameError}
              onChange={handleNameChange}
              placeholder="Catchy name..."
              disabled={isSubmitting}
            />
            <TextField
              name="Description"
              value={description}
              error={descriptionError}
              onChange={handleDescriptionChange}
              multiline
              placeholder="Some great description..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-inherit p-4 shadow-sm">
            <DescribeSection
              title="Collection Cards"
              content="Donec gravida vulputate convallis. Ut feugiat bibendum luctus.
          Donec ut elementum nunc, a eleifend erat. Sed sit amet sem tortor.
          Vivamus maximus, enim non euismod ullamcorper, lectus nibh
          pellentesque nulla, non efficitur neque est a ligula. Class aptent
          taciti sociosqu ad litora torquent per conubia nostra, per
          inceptos himenaeos. Suspendisse mauris diam, aliquam nec magna
          vel, porttitor ullamcorper elit."
            />

            <UploadField
              multiple
              onReceive={handleFilesReceive}
              error={uploadError}
              disabled={isSubmitting}
            >
              Upload
            </UploadField>

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-neutral-200 p-16 opacity-20 dark:bg-neutral-700">
                <Empty size={56} />
                <p className="text-sm ">No cards yet...</p>
              </div>
            ) : (
              <div>
                <ul className="flex flex-wrap justify-center gap-2">
                  {files.map((it, i) => (
                    <li
                      key={i}
                      className="flex flex-col justify-between gap-2 rounded bg-neutral-200 text-xs shadow-lg dark:bg-neutral-700"
                      style={{
                        width: MINI_CARD_WIDTH,
                        height: MINI_CARD_WIDTH * CARD_ASPECT,
                      }}
                    >
                      <div
                        className="flex flex-1 justify-between rounded-t bg-white/20 bg-contain p-2"
                        style={{
                          backgroundImage: `url("${it.previewUrl ?? ""}")`,
                        }}
                      >
                        <button
                          className="h-min"
                          onClick={() => handleDelete(i)}
                        >
                          <Close size={12} />
                        </button>

                        <StatusProgress value={it} />
                      </div>
                      <p className="truncate px-2 pb-2">{it.file.name}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-right text-xs opacity-50">
                  {files.length} card{files.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex-1 ${
                isSubmitting ? "opacity-100" : "opacity-0"
              } relative rounded bg-neutral-200 transition-opacity dark:bg-neutral-700`}
            >
              <div
                className="l-0 absolute h-full rounded bg-indigo-400 shadow-2xl shadow-indigo-500"
                style={{ width: `${submitPerc}%` }}
              />
              <p className="relative z-10 py-px px-2 text-xs">{submitPerc}%</p>
            </div>
            <SubmitField onSubmit={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Spin label="Submitting" size={12} />
              ) : (
                <>Submit</>
              )}
            </SubmitField>
          </div>
        </div>
      </LayoutCentered>
    </LayoutWithNav>
  );
};

export default CreatePage;

interface DescribeSectionProps {
  title: string;
  content: string;
}

const DescribeSection = ({ title, content }: DescribeSectionProps) => (
  <section>
    <h1 className="mb-2 text-xl">{title}</h1>
    <p className="text-sm opacity-80">{content}</p>
  </section>
);

interface Uploadable {
  status: "uploaded" | "uploading" | "evaluating" | "error";
  progress: number;
  previewUrl?: string;
  file: File;
}

interface StatusProgressProps {
  value: Uploadable;
}

const CONFIG_FROM_STATUS: Record<
  Uploadable["status"],
  { color: string; label: string }
> = {
  error: { color: "red", label: "error" },
  evaluating: { color: "yellow", label: "evaluating" },
  uploading: { color: "blue", label: "uploading" },
  uploaded: { color: "green", label: "uploaded" },
};

const StatusProgress = ({ value }: StatusProgressProps) => {
  if (typeof value.previewUrl === "undefined") {
    return (
      <div className="h-min rounded bg-gray-200 p-1 text-gray-600">
        <Spin size={10} />
      </div>
    );
  }

  const { color, label } = CONFIG_FROM_STATUS[value.status];

  if (!color || !label) throw new Error(`Invalid status: ${value.status}`);

  return (
    <div
      className={`bg-${color}-200 flex h-min items-center gap-1 rounded px-1 text-${color}-600`}
    >
      {value.progress < 100 && <Spin size={10} />}
      <p>
        {label}
        {value.progress < 100 && <span> {value.progress}%</span>}
      </p>
    </div>
  );
};
