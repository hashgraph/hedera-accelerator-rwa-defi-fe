import { isEmpty } from "lodash";
import { FormSelect } from "../ui/formSelect";
import { SelectItem, SelectSeparator } from "../ui/select";

interface FilterOptions {
   constructedYear?: string[];
   type?: string[];
   location?: string[];
   locationType?: string[];
}

interface FilterState {
   constructedYear?: string;
   type?: string;
   location?: string;
   locationType?: string;
}

interface BuildingFilterProps {
   options: FilterOptions;
   filterState: FilterState;
   onFilterChange: (filterKey: string, value: string | undefined) => void;
}

export const BuildingFilter = ({ options, filterState, onFilterChange }: BuildingFilterProps) => {
   return (
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-4 border-b pb-4">
         <FormSelect
            name="constructedYear"
            label="Construction Year"
            onValueChange={(value) => onFilterChange("constructedYear", value)}
            value={filterState.constructedYear}
         >
            <SelectItem key={"all"} value={null}>
               All
            </SelectItem>
            {!isEmpty(options.constructedYear) && <SelectSeparator />}
            {options.constructedYear?.map((year) => (
               <SelectItem key={year} value={String(year)}>
                  {year}
               </SelectItem>
            ))}
         </FormSelect>

         <FormSelect
            name="type"
            label="Type"
            onValueChange={(value) => onFilterChange("type", value)}
            value={filterState.type}
         >
            <SelectItem key={"all"} value={null}>
               All
            </SelectItem>
            {!isEmpty(options.type) && <SelectSeparator />}
            {options.type?.map((type) => (
               <SelectItem key={type} value={type}>
                  {type}
               </SelectItem>
            ))}
         </FormSelect>

         <FormSelect
            name="location"
            label="Location"
            onValueChange={(value) => onFilterChange("location", value)}
            value={filterState.location}
         >
            <SelectItem key={"all"} value={null}>
               All
            </SelectItem>
            {!isEmpty(options.location) && <SelectSeparator />}
            {options.location?.map((location) => (
               <SelectItem key={location} value={location}>
                  {location}
               </SelectItem>
            ))}
         </FormSelect>

         <FormSelect
            name="locationType"
            label="Location Type"
            onValueChange={(value) => onFilterChange("locationType", value)}
            value={filterState.locationType}
         >
            <SelectItem key={"all"} value={null}>
               All
            </SelectItem>
            {!isEmpty(options.locationType) && <SelectSeparator />}
            {options.locationType?.map((locationType) => (
               <SelectItem key={locationType} value={locationType}>
                  {locationType}
               </SelectItem>
            ))}
         </FormSelect>
      </div>
   );
};
