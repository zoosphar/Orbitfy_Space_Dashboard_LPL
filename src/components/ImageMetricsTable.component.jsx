import { map, get, isEmpty } from "lodash";

function ImageMetricsTable({ metrics }) {
  return (
    <div className="grid-cols-2 h-full overflow-scroll">
      <div className="h-[48px] bg-[#FFC000] rounded-tl-xl rounded-tr-xl w-full col-span-2 flex justify-between items-center top-0 sticky">
        <div className="w-[50%] font-bold text-left ml-16">Metric</div>
        <div className="w-[50%] font-bold text-left ml-40">Value</div>
      </div>
      {map(
        metrics,
        (metric) =>
          !isEmpty(get(metric, "sectionProperties")) && (
            <>
              {/* Category */}
              <div className="h-[44px] bg-[#FFC000] bg-opacity-20 w-full col-span-2 flex justify-start items-center">
                <div className="font-bold text-[#FFC000] ml-12">
                  {get(metric, "sectionName")}
                </div>
              </div>

              {/* Key Value of the category */}
              {map(
                Object.keys(get(metric, "sectionProperties") || {}),
                (propertyKey) => (
                  <div
                    className="h-[40px] bg-[#2B2D33] bg-opacity-20 w-full col-span-2 flex justify-between items-center"
                    key={propertyKey}
                  >
                    <div className="w-[50%] font-medium text-white text-left ml-16">
                      {propertyKey}
                    </div>
                    <div className="w-[50%] font-bold text-white text-left ml-40">
                      {get(metric, "sectionProperties")[propertyKey]}
                    </div>
                  </div>
                )
              )}
            </>
          )
      )}
    </div>
  );
}

export default ImageMetricsTable;
