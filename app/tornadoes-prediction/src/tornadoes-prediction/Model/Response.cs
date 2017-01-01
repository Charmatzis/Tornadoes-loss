using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace tornadoes_prediction.Model
{

    public class Response
    {
        public Results Results { get; set; }
    }

    public class Results
    {
        public Output1[] output1 { get; set; }
    }

    public class Output1
    {
        public string State { get; set; }
        public string Losses { get; set; }
        public string Probability { get; set; }
    }

}




