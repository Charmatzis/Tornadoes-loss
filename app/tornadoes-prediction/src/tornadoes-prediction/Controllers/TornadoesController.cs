using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using tornadoes_prediction.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace tornadoes_prediction.Controllers
{
    [Route("api/[controller]")]
    public class TornadoesController : Controller
    {
        [HttpGet]
        public async Task<JsonResult> Get(Request request)
        {
            Response response = new Response();
            response = await InvokeRequestResponseService(request);
            if (response != null)
            {
                var result = new Output1() {
                    State = response.Results.output1[0].State,
                    Month = response.Results.output1[0].Month,
                    Losses = response.Results.output1[0].Losses,
                    Probability = response.Results.output1[0].Probability
                };
                
                return Json(result);
                
                //return new string[] { state, month, loss, probability };
            }
            else
            {
                return null;
            }
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        private async Task<Response> InvokeRequestResponseService(Request request)
        {
            using (var client = new HttpClient())
            {
                var scoreRequest = new
                {
                    Inputs = new Dictionary<string, List<Dictionary<string, string>>>() {
                        {
                            "input1",
                            new List<Dictionary<string, string>>(){new Dictionary<string, string>(){
                                            {
                                                "Month", request.Month
                                            },
                                            {
                                                "State", request.State
                                            },
                                            {
                                                "F-Scale", request.FScale.ToString()
                                            },
                                            {
                                                "Losses", "less than $5,000,000"
                                            },
                                            {
                                                "Length(miles)", request.Lengthmiles.ToString()
                                            },
                                            {
                                                "Width(yards)", request.Widthyards.ToString()
                                            },
                                }
                            }
                        },
                    },
                    GlobalParameters = new Dictionary<string, string>()
                    {
                    }
                };

                const string apiKey = ""; // Replace this with the API key for the web service

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                client.BaseAddress = new Uri("https://ussouthcentral.services.azureml.net/workspaces/73b16fd087ab4caab38efba1867bd365/services/ca86e868c5c445b6a19c5a5385828440/execute?api-version=2.0&format=swagger");
                HttpResponseMessage response = await client.PostAsJsonAsync("", scoreRequest);

                if (response.IsSuccessStatusCode)
                {
                    string result = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    var resultOutcome = JsonConvert.DeserializeObject<Response>(result);

                    return resultOutcome;
                }
                else
                {
                    Console.WriteLine(string.Format("The request failed with status code: {0}", response.StatusCode));

                    // Print the headers - they include the requert ID and the timestamp,
                    // which are useful for debugging the failure
                    Console.WriteLine(response.Headers.ToString());

                    string responseContent = await response.Content.ReadAsStringAsync();
                    return null;
                }
            }
        }
    }
}