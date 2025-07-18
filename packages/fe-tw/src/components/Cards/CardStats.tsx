import React from "react";
//import PropTypes from "prop-types";

export default function CardStats(prop: CardStatsPropTypes) {
   const {
      statSubtitle,
      statTitle,
      statArrow,
      statPercent,
      statPercentColor,
      statDescripiron,
      statIconName,
      statIconColor,
   } = { ...defaultProps, ...prop };
   return (
      <>
         <div className="relative flex flex-col min-w-0 break-words bg-white rounded-sm mb-6 xl:mb-0 shadow-lg text-black">
            <div className="flex-auto p-4">
               <div className="flex flex-wrap">
                  <div className="relative w-full pr-4 max-w-full grow flex-1">
                     <h5 className="text-slate-400 uppercase font-bold text-xs">{statSubtitle}</h5>
                     <span className="font-semibold text-xl text-slate-700">{statTitle}</span>
                  </div>
                  <div className="relative w-auto pl-4 flex-initial">
                     <div
                        className={`text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full ${statIconColor}`}
                     >
                        <i className={statIconName} />
                     </div>
                  </div>
               </div>
               <p className="text-sm text-slate-400 mt-4">
                  <span className={`${statPercentColor} mr-2`}>
                     <i
                        className={
                           statArrow === "up"
                              ? "fas fa-arrow-up"
                              : statArrow === "down"
                                ? "fas fa-arrow-down"
                                : ""
                        }
                     />{" "}
                     {statPercent}%
                  </span>
                  <span className="whitespace-nowrap">{statDescripiron}</span>
               </p>
            </div>
         </div>
      </>
   );
}

const defaultProps: CardStatsPropTypes = {
   statSubtitle: "Traffic",
   statTitle: "350,897",
   statArrow: "up",
   statPercent: "3.48",
   statPercentColor: "text-emerald-500",
   statDescripiron: "Since last month",
   statIconName: "far fa-chart-bar",
   statIconColor: "bg-red-500",
};

interface CardStatsPropTypes {
   statSubtitle?: string;
   statTitle?: string;
   statArrow?: "up" | "down";
   statPercent?: string;
   // can be any of the text color utilities
   // from tailwindcss
   statPercentColor?: string;
   statDescripiron?: string;
   statIconName?: string;
   // can be any of the background color utilities
   // from tailwindcss
   statIconColor?: string;
}
