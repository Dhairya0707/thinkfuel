import { Lightbulb } from "lucide-react";
import Transition from "../Utils/Transition";
import ForgotComponent from "../../components/forgot-form";

export default function Forgot() {
  return (
    <Transition direction="right">
      <div className="grid min-h-svh ">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center  md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Lightbulb className="size-4" />
              </div>
              ThinkFuel
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <ForgotComponent />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
