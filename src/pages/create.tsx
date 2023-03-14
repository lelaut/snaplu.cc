import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { List, type ListRowRenderer } from "react-virtualized";

import { CARD_ASPECT } from "../components/Collection";
import { SubmitField, TextField, UploadField } from "../components/Field";
import { Close, Empty, Spin } from "../components/Icon";
import { LayoutCentered, LayoutWithNav } from "../components/Layout";
import Modal from "../components/Modal";
import {
  type SupportedCurrencies,
  supportedCurrencies,
} from "../utils/payment";
import { api } from "../utils/api";
import { formatBigintMoney } from "../utils/format";
import { useOutsideEvent } from "../utils/hooks";
import { rarity } from "../utils/rarity";
import { type NonEmpty } from "../utils/types";

const MINI_CARD_WIDTH = 175;

// TODO: deal with image preview error
const CreatePage: NextPage = () => {
  const router = useRouter();

  const createCollection = api.collection.create.useMutation();
  const confirmCollection = api.collection.confirm.useMutation();

  const rarityMenuRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<
    { currency: SupportedCurrencies; unitAmount: number }[]
  >([{ currency: "usd", unitAmount: 0 }]);
  const [files, setFiles] = useState<Uploadable[]>([]);
  const [cardRarity, setCardRarity] = useState<(number | undefined)[]>([]);
  const [rarityMenuOnCard, setRarityMenuOnCard] = useState<
    number | undefined
  >();

  const [nameError, setNameError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [uploadError, setUploadError] = useState<string | undefined>();

  const [selectingCurrency, setSelectingCurrency] = useState<
    SupportedCurrencies | undefined
  >();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPerc, setSubmitPerc] = useState("0");

  const currenciesWithPrice = useMemo(
    () => price.map(($) => $.currency),
    [price]
  );
  const currenciesWithoutPrice = useMemo(
    () => supportedCurrencies.filter(($) => !currenciesWithPrice.includes($)),
    [currenciesWithPrice]
  );

  const handleNameChange = (newName: string) => {
    setName(newName);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handlePriceChange = (priceIdx: number, newValue: string) => {
    setPrice(
      price.map(($, i) =>
        i === priceIdx
          ? {
              currency: $.currency,
              unitAmount: +newValue.replace(/[^0-9]/gm, ""),
            }
          : $
      )
    );
  };

  const handlePriceAddIntent = () => {
    setSelectingCurrency(currenciesWithoutPrice[0] ?? "brl");
  };

  const stopSelectingCurrency = () => {
    setSelectingCurrency(undefined);
  };

  const addPriceForSelectedCurrency = () => {
    setPrice(
      price.concat({ currency: selectingCurrency ?? "brl", unitAmount: 0 })
    );
    stopSelectingCurrency();
  };

  const handlePriceRemove = (priceIdx: number) => {
    setPrice(price.filter((_, i) => i !== priceIdx));
  };

  const handleCardRarityClick = (cardIdx: number) => {
    setRarityMenuOnCard(cardIdx);
  };

  const handleCardRarityChange = (
    cardIdx: number,
    rarity: number | undefined
  ) => {
    setCardRarity(cardRarity.map((v, i) => (i === cardIdx ? rarity : v)));
    closeRarityMenu();
  };

  const closeRarityMenu = () => {
    setRarityMenuOnCard(undefined);
  };

  const handleFilesReceive = (received: FileList) => {
    for (const fileReceived of received) {
      if (!files.find((f) => f.file.name === fileReceived.name)) {
        setFiles(
          files.concat([
            { file: fileReceived, status: "evaluating", progress: 0 },
          ])
        );
        setCardRarity(cardRarity.concat(undefined));

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

  const handleCardDelete = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
    setCardRarity(cardRarity.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const progressStep = 100 / (2 + files.length);

    setIsSubmitting(true);
    setSubmitPerc(String(0));

    const createResponse = await createCollection.mutateAsync({
      name,
      description,
      cards: cardRarity.map((ridx) => ({
        rarity: rarity[ridx ?? -1]?.value,
      })) as unknown as NonEmpty<{ rarity: string }>,
      price: {
        currency: price[0]?.currency ?? "usd",
        unitAmount: price[0]?.unitAmount ?? 10,
        others: price.slice(1),
      },
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
          // TODO: need to upload both small and high res
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

  useOutsideEvent(rarityMenuRef, closeRarityMenu);

  const CURRENCY_ROW_H = 40;
  const renderCurrencyRow: ListRowRenderer = ({ key, style, index }) => {
    const currency = currenciesWithoutPrice[index];

    return (
      <div key={key} style={style}>
        <div
          className={`flex w-full rounded px-4 ${
            selectingCurrency === currency
              ? "bg-blue-500 text-white dark:bg-blue-500"
              : "bg-neutral-200 dark:bg-neutral-700"
          }`}
          style={{ height: CURRENCY_ROW_H - 8 }}
        >
          <p className="my-auto">{currency?.toUpperCase()}</p>
        </div>
      </div>
    );
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

            <div>
              <TextField
                name="Price per game"
                value={formatBigintMoney(price[0]?.unitAmount ?? 0)}
                onChange={(v) => handlePriceChange(0, v)}
                placeholder="Some great description..."
                disabled={isSubmitting}
                posfix={price[0]?.currency.toUpperCase()}
              />
              {currenciesWithoutPrice.length > 0 && (
                <div className="flex flex-row-reverse">
                  <button
                    onClick={handlePriceAddIntent}
                    className="rounded-b bg-green-400 px-2 py-px text-xs text-green-700 hover:bg-green-300"
                  >
                    + Currency
                  </button>
                </div>
              )}
            </div>

            {price.length > 1 && (
              <div>
                <p>For other currencies</p>
                {price.slice(1, price.length).map(($, i) => (
                  <div key={i} className="flex items-center">
                    <TextField
                      value={formatBigintMoney($.unitAmount)}
                      onChange={(v) => handlePriceChange(i + 1, v)}
                      disabled={isSubmitting}
                      posfix={$.currency.toUpperCase()}
                    />
                    <button
                      onClick={() => handlePriceRemove(i + 1)}
                      className="px-2 hover:opacity-60"
                    >
                      <Close size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                    <li key={i} className="flex">
                      <div
                        className="flex flex-col justify-between gap-2 rounded-b bg-neutral-300 text-xs shadow-lg dark:bg-neutral-900"
                        style={{
                          width: MINI_CARD_WIDTH,
                          height: MINI_CARD_WIDTH * CARD_ASPECT,
                        }}
                      >
                        <div
                          className="flex flex-1 flex-col justify-between rounded-t bg-white/20 bg-contain bg-center bg-no-repeat p-2"
                          style={{
                            backgroundImage: `url("${it.previewUrl ?? ""}")`,
                          }}
                        >
                          <div className="flex h-min w-full items-center justify-between">
                            <button
                              className="h-min rounded-full bg-black/50 p-1 backdrop-blur-sm"
                              onClick={() => handleCardDelete(i)}
                            >
                              <Close size={12} />
                            </button>

                            <div className="h-min rounded-full bg-black/50 p-1 backdrop-blur-sm">
                              <StatusProgress value={it} />
                            </div>
                          </div>
                          <div className="flex flex-row-reverse justify-between">
                            <button
                              onClick={() => handleCardRarityClick(i)}
                              className="rounded-full bg-blue-500 px-2 py-px hover:opacity-80"
                              style={{
                                backgroundColor:
                                  rarity[cardRarity[i] as number]?.background,
                                color:
                                  rarity[cardRarity[i] as number]?.onBackground,
                              }}
                            >
                              {rarity[cardRarity[i] as number]?.label ?? "Free"}{" "}
                              ⇾
                            </button>
                          </div>
                        </div>
                        <div className="px-2 pb-2">
                          {/* TODO: display upload error here */}
                        </div>
                      </div>
                      {rarityMenuOnCard === i && (
                        <ul
                          ref={rarityMenuRef}
                          className="mt-2 h-min bg-black text-xs"
                        >
                          <li
                            className="cursor-pointer bg-blue-500 p-1 text-blue-700 hover:opacity-80"
                            onClick={() => handleCardRarityChange(i, undefined)}
                          >
                            Free
                          </li>
                          {rarity.map(($, j) => (
                            <li
                              key={j}
                              style={{
                                backgroundColor: $.background,
                                color: $.onBackground,
                              }}
                              className="cursor-pointer p-1 hover:opacity-80"
                              onClick={() => handleCardRarityChange(i, j)}
                            >
                              {$.label}
                            </li>
                          ))}
                        </ul>
                      )}
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

        {typeof selectingCurrency !== "undefined" && (
          <Modal close={stopSelectingCurrency}>
            <div className="flex flex-col gap-4">
              <h2 className="tracking-wider opacity-50">Currencies</h2>
              <List
                rowHeight={CURRENCY_ROW_H}
                rowCount={currenciesWithoutPrice.length}
                rowRenderer={renderCurrencyRow}
                overscanRowCount={2}
                width={250}
                height={200}
              />
              <div className="flex flex-row-reverse">
                <button
                  onClick={addPriceForSelectedCurrency}
                  className="rounded-sm bg-blue-500 px-4 py-1 text-white hover:bg-blue-400"
                >
                  Select
                </button>
              </div>
            </div>
          </Modal>
        )}
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
        {value.progress >= 100 && label}
        {value.progress < 100 && <span> {value.progress}%</span>}
      </p>
    </div>
  );
};
