require "practice_search_index"

RSpec.describe(PracticeSearchIndex, "#find") do
  subject(:index) {
    PracticeSearchIndex.new(
      practices: practices,
      max_results: 10,
    )
  }

  let(:practices) {
    [
      heathcote_medical_centre,
    ]
  }

  let(:heathcote_medical_centre) {
    {
      code: "H81070",
      name: "Heathcote Medical Centre",
      address: "Heathcote, Tadworth, Surrey, KT20 5TH",
    }
  }

  context "with no matches" do
    it "returns an empty array" do
      expect(index.find("xyz")).to eq([])
    end
  end

  context "with one match for the practice name" do
    it "returns one result" do
      expect(index.find("medical")).to eq(
        [
          {
            code: "H81070",
            name: {
              value: "Heathcote Medical Centre",
              matches: [
                [10, 16],
              ],
            },
            address: {
              value: "Heathcote, Tadworth, Surrey, KT20 5TH",
              matches: [],
            },
            score: {
              name: 7,
              address: 0,
            }
          }
        ]
      )
    end
  end

  context "with one match for the address" do
    it "returns one result" do
      expect(index.find("tadworth")).to eq(
        [
          {
            code: "H81070",
            name: {
              value: "Heathcote Medical Centre",
              matches: [],
            },
            address: {
              value: "Heathcote, Tadworth, Surrey, KT20 5TH",
              matches: [
                [11, 18],
              ],
            },
            score: {
              name: 0,
              address: 8,
            }
          }
        ]
      )
    end
  end

  context "with a match for both name and address" do
    it "returns one result" do
      expect(index.find("heathcote")).to eq(
        [
          {
            code: "H81070",
            name: {
              value: "Heathcote Medical Centre",
              matches: [
                [0, 8],
              ],
            },
            address: {
              value: "Heathcote, Tadworth, Surrey, KT20 5TH",
              matches: [
                [0, 8],
              ],
            },
            score: {
              name: 10,
              address: 10,
            }
          }
        ]
      )
    end
  end
end