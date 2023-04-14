import useSWR from "swr";
import { get } from "helpers/requests";

export const useChannels = () => {
  const { data, error, isLoading } = useSWR({ url: "channels" }, (payload) =>
    get(payload)
  );
  return {
    channels:
      data !== undefined
        ? data.map((channel) => {
            return {
              key: channel.name,
              label: channel.name,
              id: channel.id,
              isRichText: channel.isRichText,
            };
          })
        : [],
    isLoading,
    isError: error,
  };
};
