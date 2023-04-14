import useSWR from "swr";
import { get } from "helpers/requests";

export const useNodeTypes = () => {
  const { data, error, isLoading } = useSWR(
    { url: "menu_node_types" },
    (payload) => get(payload)
  );
  return {
    nodeTypes: data,
    isLoading,
    isError: error,
  };
};
