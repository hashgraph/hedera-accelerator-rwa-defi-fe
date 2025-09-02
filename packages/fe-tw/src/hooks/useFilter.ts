import { filter, get, isMatch } from "lodash";
import { parseAsString, useQueryStates } from "nuqs";

interface IConfiguration {
   filterPropertiesPath?: string;
}

interface FilterOptions {
   [key: string]: any;
}

interface UseFilterReturn<T, F> {
   filteredItems: T[];
   filterState: F;
   handleFilterChange: (filterName: keyof F, value: any) => void;
}

export const useFilter = <T = any, F extends Record<string, any> = Record<string, any>>(
   items: T[],
   filterOptions: FilterOptions,
   configuration?: IConfiguration,
): UseFilterReturn<T, F> => {
   const [filterState, setFilterState] = useQueryStates(filterOptions) as [
      F,
      (updater: (prev: F) => F) => void,
   ];

   const handleFilterChange = (filterName: keyof F, value: any) => {
      setFilterState((prevState: F) => ({
         ...prevState,
         [filterName]: value,
      }));
   };

   const filteredItems = filter(items, (item) => {
      return isMatch(
         get(item, configuration?.filterPropertiesPath || ""),
         Object.fromEntries(Object.entries(filterState).filter(([_, v]) => v != null)),
      );
   });

   return {
      filteredItems,
      filterState,
      handleFilterChange,
   };
};
