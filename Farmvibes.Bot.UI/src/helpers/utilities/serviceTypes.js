import useSWR from "swr";
import { get } from "helpers/requests";

export const useServiceTypes = () => {
  const { data, error, isLoading } = useSWR(
    { url: "service_types" },
    (payload) => get(payload)
  );
  return {
    serviceTypes: data,
    isLoading,
    isError: error,
  };
};
