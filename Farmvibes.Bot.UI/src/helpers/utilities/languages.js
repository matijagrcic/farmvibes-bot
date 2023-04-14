import useSWR from "swr";
import { get } from "helpers/requests";

export const useLanguages = () => {
  const { data, error, isLoading } = useSWR(
    {
      url: "languages",
      params: {
        "groups[]": "translations",
      },
    },
    (payload) => get(payload)
  );
  return {
    languages: data,
    locale: data !== undefined ? data.filter((l) => l.isDefault)[0].code : "",
    isLoading,
    isError: error,
  };
};
