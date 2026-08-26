import type { ProjectSection } from "../../our-works-data";

export const EDA_ENGINEERING_SECTION: ProjectSection = {
  id: "eda-engineering",
  slug: "eda",
  title: "EDA & Engineering",
  subtitle: "Electronic design automation tools and simulation software",
  description:
    "Over a dozen years developing HDL compiler, simulation and advanced debugging tools for large scale System Verilog models. Development of CAD & CAE software used at design and verification processes at biggest engineering companies worldwide.",
  expertise_ids: ["eda", "engineering"],
  projects: [
    {
      title: "SynaptiCAD - Verilogger",
      description:
        "SynaptiCAD Verilogger Extreme bundle consists of a HDL GUI debugger (BugHunter Pro) and a command-line based Verilog compiler (simx). We have been developing the compiler and its simulation engine for over a dozen years, targeting large-scale Verilog and SystemVerilog models where elaboration time and memory footprint decide whether a design can be simulated at all. The bundle is licensed to engineering companies for day-to-day design and verification work and remains under continuous development.",
      deployments: [
        {
          label: "Site",
          url: "http://www.syncad.com/vlg_verilog_compiler_simulator.htm",
        },
      ],
    },
    {
      title: "SynaptiCAD - BugHunter Pro",
      description:
        "Graphical debugging environment for Verilog, VHDL and C++ simulators. It drives a simulation from the source side — breakpoints, single-stepping and variable inspection in HDL code — while the waveform view stays synchronized with the same run, so a wrong signal can be traced back to the line that drove it. It works with the bundled simx compiler and with third-party simulators, which lets a team keep its existing simulation flow and change only the debugger.",
      deployments: [
        {
          label: "Site",
          url: "http://www.syncad.com/vhdl_verilog_debugger.htm",
        },
      ],
    },
    {
      title: "SynaptiCAD - Test Bench Generators",
      description:
        "TestBencher Pro is a graphical test bench generator that dramatically reduces the time required to create and maintain test benches for VHDL and Verilog. Timing diagrams drawn against a component's interface are compiled into test bench code, so a change in the specification is regenerated instead of hand-edited across thousands of lines. The generated benches drive the simulator and check the responses, which keeps the diagram — the artefact engineers actually review — as the source of truth.",
      deployments: [
        {
          label: "Site",
          url: "http://www.syncad.com/testbencher_verilog_vhdl_testbench_generator.htm",
        },
      ],
    },
    {
      title: "ModelCenter Integrate",
      description:
        "ModelCenter Integrate increases productivity by enabling users to execute significantly more simulations with less time and resources. It wraps existing engineering tools — CAD packages, analysis codes, spreadsheets, scripts — into a single automated workflow, so a parametric or trade study runs end to end instead of being driven by hand from one application to the next. Runs can be spread across available compute resources, which is what turns a handful of manual design iterations into a systematic exploration of the design space. Built for Phoenix Integration, a long-standing client now part of ANSYS.",
    },
  ],
};
