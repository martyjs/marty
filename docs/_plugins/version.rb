require 'yaml'

module Jekyll
  class Version < Liquid::Tag

    def initialize(tag_name, collection_name, tokens)
      super
    end

    def render(context)
      config_path = File.expand_path(File.dirname(__FILE__) + "/../_config.yml")
      version = YAML.load_file(config_path)['current_version']

      if ENV['VERSION'] == 'true'
        "/v/#{version}".strip
      end
    end
  end
end

Liquid::Template.register_tag('version', Jekyll::Version)