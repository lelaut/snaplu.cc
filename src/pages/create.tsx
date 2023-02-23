import { NextPage } from "next";
import { useState } from "react";
import { SubmitField, TextField, UploadField } from "../components/Field";
import { Empty } from "../components/Icons";
import { LayoutCentered, LayoutWithNav } from "../components/Layout";

const CreatePage: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [uploadError, setUploadError] = useState<string | undefined>();

  const handleNameChange = (newName: string) => {
    setName(newName);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handleFilesReceive = (_files: FileList) => {
    const newFiles = [];

    for (const file of _files) {
      if (!files.includes(file.name)) {
        newFiles.push(file.name);
      }
    }
    console.log({ newFiles, _files });

    setFiles(files.concat(newFiles));
  };

  const handleSubmit = () => {};

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
            />
            <TextField
              name="Description"
              value={description}
              error={descriptionError}
              onChange={handleDescriptionChange}
              multiline
              placeholder="Some great description..."
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
                <ul className="flex flex-wrap gap-2">
                  {files.map((it, i) => (
                    <li
                      key={i}
                      className="flex flex-col justify-between gap-2 rounded bg-neutral-200 p-2 text-xs opacity-70 dark:bg-neutral-700"
                      style={{ width: 150, height: 200 }}
                    >
                      <div className="flex flex-1 justify-between">
                        <button className="h-min">x</button>

                        <p className="h-min rounded bg-green-400 px-1">
                          Uploaded
                        </p>
                      </div>
                      <p className="truncate">{it}</p>
                      {/* <div className="flex min-w-0 gap-4"> */}
                      {/* TODO: use close icon */}
                      {/* <p>X</p>
                        <p className="truncate">{it}</p>
                      </div> */}
                      {/* TODO: change based on the status */}
                      {/* <p className="rounded-full bg-green-200 px-2">Uploaded</p> */}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-right text-xs opacity-50">
                  {files.length} card{files.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          <SubmitField onSubmit={handleSubmit}>Submit</SubmitField>
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
