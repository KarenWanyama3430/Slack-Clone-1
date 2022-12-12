import React, { Component } from "react";
import {
  Segment,
  Header,
  Accordion,
  Icon,
  Image,
  List,
} from "semantic-ui-react";
import { connect } from "react-redux";

export class MetaPanel extends Component {
  state = {
    activeIndex: 0,
  };
  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };
  render() {
    const { activeIndex } = this.state;
    const { currentChannel, userPosts } = this.props;
    return (
      <Segment>
        <Header as="h3" attached="top">
          About # channel
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {currentChannel.details}
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>
              {userPosts &&
                Object.keys(userPosts)
                  .sort((a, b) => userPosts[b].count - userPosts[a].count)
                  .map((key) => {
                    const newObj = {
                      name: key,
                      ...userPosts[key],
                    };

                    return (
                      <List.Item key={key}>
                        <Image avatar src={newObj.avatar} />
                        <List.Content>
                          <List.Header as="a">{key}</List.Header>
                          <List.Description>
                            {newObj.count} posts
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    );
                  })
                  .slice(0, 5)}
            </List>
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Image avatar src={currentChannel.createdBy.avatar} />
            {currentChannel.createdBy.name}
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentChannel: state.channel.currentChannel,
    userPosts: state.user.userPosts,
  };
};

export default connect(mapStateToProps)(MetaPanel);
