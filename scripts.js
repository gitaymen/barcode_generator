const barcodes = $("#barcodes");
const printArea = $("#print-area");
const defaultOptions = {
  number: true,
  prefix: true,
  color: "#000000",
  background: null,
  debug: false,
  padding: 0,
  onSuccess: function (number) {}, // Fired if the checksum of the provided code is correct. Not used if a 12 digit code is provided.
  onValid: function () {}, // Fired is the checksum is not correct. Not used if a 12 digit code is provided.
  onInValid: function () {}, // Fired at the end of the painting process and if no errors occurred. Gives the number (including generated or provided checksum) as parameter.
  onError: function () {}, // Fired if the were any errors while painting. (For instance the canvas element is not present)
};

var barcodes_list = [];
var options = {
  number: true,
  prefix: true,
  color: "#000000",
  background: null,
  debug: false,
  padding: 0,
};

function reset() {
  options = { ...defaultOptions };
  $("#number").prop("checked", defaultOptions.number);
  $("#prefix").prop("checked", defaultOptions.prefix);
  $("#debug").prop("checked", defaultOptions.debug);
  $("#color").val(defaultOptions.color);
  $("#background").val("#ffffff");
  $("#padding").val(defaultOptions.padding);
  console.log("Rendering...");
  render(barcodes_list);
}

$("#settings").on("change", "input", function (e) {
  if ($(this).attr("type") == "checkbox") {
    options[$(this).attr("id")] = $(this).is(":checked");
  } else {
    if ($(this).attr("id") === "padding") {
      options[$(this).attr("id")] = $(this).val() * 1;
    } else {
      options[$(this).attr("id")] = $(this).val();
    }
  }
  console.log("Rendering...");
  render(barcodes_list);
});

function randomNumber(quantity, max) {
  const arr = [];
  while (arr.length < quantity) {
    var candidateInt = Math.floor(Math.random() * max);
    arr.push(candidateInt);
  }
  return arr;
}

function generateEAN13Code() {
  const barcode = randomNumber(12, 9);
  let x = (y = 0);
  for (let i = 0; i < barcode.length; i++) {
    if (i % 2 === 0) {
      x += barcode[i];
    } else {
      y += barcode[i];
    }
  }
  let z = (x + 3) * y;
  const lastDigit = 10 - (z % 10);

  barcode.push(lastDigit % 10);
  return barcode;
}

function generate() {
  let num = $("#num").val();
  if (num <= 0) {
    alert("Enter a postive number.");
    return;
  }
  console.log(`Generating ${num} barcodes...`);
  const list = [];
  while (num > 0) {
    list.push(generateEAN13Code().join(""));
    num--;
  }
  barcodes_list = list;
  console.log(`Generated barcodes:`, list);
  console.log(`${$("#num").val()} barcodes being rendered...`);
  render(barcodes_list);
}
function render(barcodes_list) {
  barcodes.html("");
  printArea.html("");
  barcodes_list.forEach((barcode, index) => {
    let tr = $("<tr></tr>");
    tr.append($("<td></td>").text(index + 1));
    tr.append($("<td></td>").text(barcode));
    tr.append(
      $("<td class='text-end'></td>").html(
        $("<canvas></canvas>").EAN13(barcode, options)
      )
    );
    tr.appendTo(barcodes);
    printArea.append(
      $("<div></div>").html(
        $("<canvas width='150px' height='75px'></canvas>").EAN13(
          barcode,
          options
        )
      )
    );
  });
  console.log(`Finished rendering.`);
}

function print() {
  if (barcodes_list.length > 0) {
    printArea.printThis({
      afterPrint: () => {
        saveBarcodes();
      },
    });
  } else {
    alert("You need to generate barcodes before printing.");
  }
}

function saveBarcodes() {
  if (barcodes_list.length > 0) {
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(
      new Blob([barcodes_list.join("\n")], {
        type: "text/csv",
      })
    );
    a.download = "barcodes.csv";
    a.click();
  } else {
    alert("Nothing to save.");
  }
}
