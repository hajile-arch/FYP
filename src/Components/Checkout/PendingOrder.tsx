import React, { Dispatch } from "react";

interface PendingOrderProps {
  seconds: number;
  setInputValue: Dispatch<React.SetStateAction<string>>;
  disabled: boolean;
  setSeconds: Dispatch<React.SetStateAction<number>>;
  handleCreateOrder: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

const PendingOrder: React.FC<PendingOrderProps> = ({
  seconds,
  setInputValue,
  disabled,
  setSeconds,
  handleCreateOrder,
  formatTime,
}) => {
  return (
    <div className="flex flex-col bg-white gap-2 border-2 rounded-md w-3/4 p-7">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-neutral-500">
            Where do you want it to be delivered to?
          </label>
          <input
            className="border-2 rounded-md h-10 ps-3"
            type="text"
            placeholder="Location"
            disabled={seconds > 0}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            className={`${
              seconds > 0 || disabled
                ? "bg-blue-200"
                : "bg-blue-600 hover:bg-blue-700"
            } rounded-md text-white px-3 h-10 transition-colors duration-500`}
            disabled={seconds > 0 || disabled}
            onClick={async () => {
              setSeconds(5 * 60);
              handleCreateOrder();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
      {seconds > 0 && (
        <p className="text-sm text-red-500">
          You may request again after {formatTime(seconds)} minutes
        </p>
      )}
    </div>
  );
};

export default PendingOrder;
