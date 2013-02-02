

desc "minify the source"
task :minify do
  require 'uglifier'

  jsstring = ""
  export_files = [
    "lib/jquery-1.8.3.min.js", "lib/underscore-1.4.2.js", "lib/base.js", "lib/vector.js",
    "lib/array.for_each.js", "lib/array.map.js", "js/svg.js", "js/jigsaw.js", "js/piece.js",
  #  "notfunny.js",
    "js/page.js"
  ]

  export_files.each do |filename|
    jsstring += File.read(filename)
  end

  output = Uglifier.new(:copyright => false).compile(jsstring)

  File.open('js/application.min.js', 'w') do |file|
    file.write(output)
  end
end
